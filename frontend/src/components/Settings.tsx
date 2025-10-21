import { useState } from 'react';
import { Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Settings = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/backup/export`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
          link.setAttribute('download', `daily-workspace-backup-${new Date().toISOString().split('T')[0]}.json`);
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
            
            <div className="flex gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-5 w-5" />
                Export Backup
              </button>

              <label className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
                <Upload className="h-5 w-5" />
                {isImporting ? 'Importing...' : 'Import Backup'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>What's included:</strong> All notes, entries, labels, fire ratings, and timestamps.
                Images are referenced but stored separately in the server.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
