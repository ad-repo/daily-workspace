import { useState } from 'react';
import { Download, Upload, Settings as SettingsIcon, Clock, Archive, FileCode } from 'lucide-react';
import axios from 'axios';
import { useTimezone } from '../contexts/TimezoneContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Settings = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingFiles, setIsDownloadingFiles] = useState(false);
  const [isExportingMarkdown, setIsExportingMarkdown] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { timezone, setTimezone } = useTimezone();

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/backup/export`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
          link.setAttribute('download', `pull-your-poop-together-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showMessage('success', 'Backup downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showMessage('error', 'Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/backup/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      showMessage('success', `Import successful! ${response.data.stats.notes_imported} notes imported.`);
    } catch (error: any) {
      console.error('Import failed:', error);
      showMessage('error', error.response?.data?.detail || 'Failed to import data');
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDownloadFiles = async () => {
    setIsDownloadingFiles(true);
    try {
      const response = await axios.get(`${API_URL}/api/uploads/download-all`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'daily-workspace-files.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showMessage('success', 'All uploaded files downloaded successfully!');
    } catch (error: any) {
      console.error('Download files failed:', error);
      if (error.response?.status === 404) {
        showMessage('error', 'No uploaded files found to download');
      } else {
        showMessage('error', 'Failed to download files');
      }
    } finally {
      setIsDownloadingFiles(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExportingMarkdown(true);
    try {
      const response = await axios.get(`${API_URL}/api/backup/export-markdown`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `daily-workspace-${new Date().toISOString().split('T')[0]}.md`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showMessage('success', 'Markdown export downloaded successfully!');
    } catch (error: any) {
      console.error('Markdown export failed:', error);
      showMessage('error', 'Failed to export as markdown');
    } finally {
      setIsExportingMarkdown(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Timezone Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timezone
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Set your timezone for accurate time display throughout the app.
            </p>
            
            <div className="max-w-md">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Select Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  showMessage('success', `Timezone updated to ${e.target.value}`);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="US Timezones">
                  <option value="America/New_York">Eastern (New York)</option>
                  <option value="America/Chicago">Central (Chicago)</option>
                  <option value="America/Denver">Mountain (Denver)</option>
                  <option value="America/Phoenix">Mountain - No DST (Phoenix)</option>
                  <option value="America/Los_Angeles">Pacific (Los Angeles)</option>
                  <option value="America/Anchorage">Alaska (Anchorage)</option>
                  <option value="Pacific/Honolulu">Hawaii (Honolulu)</option>
                </optgroup>
                <optgroup label="Canada">
                  <option value="America/Toronto">Eastern (Toronto)</option>
                  <option value="America/Winnipeg">Central (Winnipeg)</option>
                  <option value="America/Edmonton">Mountain (Edmonton)</option>
                  <option value="America/Vancouver">Pacific (Vancouver)</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Paris (CET/CEST)</option>
                  <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                  <option value="Europe/Rome">Rome (CET/CEST)</option>
                  <option value="Europe/Madrid">Madrid (CET/CEST)</option>
                  <option value="Europe/Moscow">Moscow (MSK)</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Shanghai">China (CST)</option>
                  <option value="Asia/Tokyo">Japan (JST)</option>
                  <option value="Asia/Seoul">South Korea (KST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                  <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                </optgroup>
                <optgroup label="Australia">
                  <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                  <option value="Australia/Melbourne">Melbourne (AEDT/AEST)</option>
                  <option value="Australia/Perth">Perth (AWST)</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="UTC">UTC</option>
                </optgroup>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Current timezone: <span className="font-medium">{timezone}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Backup & Restore Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Backup & Restore
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              Export your data to create a backup, or restore from a previous backup file.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-5 w-5" />
                Export Data
              </button>

              <label className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
                <Upload className="h-5 w-5" />
                {isImporting ? 'Importing...' : 'Import Data'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadFiles}
                disabled={isDownloadingFiles}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Archive className="h-5 w-5" />
                {isDownloadingFiles ? 'Downloading...' : 'Download Files'}
              </button>

              <button
                onClick={handleExportMarkdown}
                disabled={isExportingMarkdown}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileCode className="h-5 w-5" />
                {isExportingMarkdown ? 'Exporting...' : 'Export as Markdown'}
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Export/Import Data:</strong> All notes, entries, labels, daily goals, search history, timestamps, 
                  and entry states (important, completed, add to report).
                </p>
                <p>
                  <strong>Download Files:</strong> Downloads all uploaded images and files as a zip archive. 
                  Use this with "Export Data" for a complete backup.
                </p>
                <p>
                  <strong>Export as Markdown:</strong> Converts all your notes to a single markdown file, 
                  perfect for feeding into LLMs like ChatGPT or Claude for analysis and insights.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
