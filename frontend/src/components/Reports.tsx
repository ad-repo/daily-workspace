import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ReportEntry {
  date: string;
  entry_id: number;
  content: string;
  content_type: string;
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  is_completed: boolean;
}

interface ReportData {
  week_start: string;
  week_end: string;
  generated_at: string;
  entries: ReportEntry[];
}

interface Week {
  start: string;
  end: string;
  label: string;
}

const Reports = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // All entries report states
  const [allEntriesReport, setAllEntriesReport] = useState<any | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [copiedAllReport, setCopiedAllReport] = useState(false);

  useEffect(() => {
    loadAvailableWeeks();
  }, []);

  const loadAvailableWeeks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/weeks`);
      setWeeks(response.data.weeks);
    } catch (error) {
      console.error('Failed to load weeks:', error);
    }
  };

  const generateReport = async (date?: string) => {
    setLoading(true);
    try {
      const url = date 
        ? `${API_URL}/api/reports/generate?date=${date}`
        : `${API_URL}/api/reports/generate`;
      
      const response = await axios.get(url);
      setReport(response.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateAllEntriesReport = async () => {
    setLoadingAll(true);
    try {
      const response = await axios.get(`${API_URL}/api/reports/all-entries`);
      setAllEntriesReport(response.data);
    } catch (error) {
      console.error('Failed to generate all entries report:', error);
      alert('Failed to generate report');
    } finally {
      setLoadingAll(false);
    }
  };

  const exportAllEntriesReport = () => {
    if (!allEntriesReport) return;

    let markdown = `# All Entries Report\n\n`;
    markdown += `**Generated:** ${new Date(allEntriesReport.generated_at).toLocaleString()}\n\n`;
    markdown += `**Total Entries:** ${allEntriesReport.entries.length}\n\n`;
    markdown += `---\n\n`;

    if (allEntriesReport.entries.length === 0) {
      markdown += `No entries found.\n`;
    } else {
      let currentDate = '';
      allEntriesReport.entries.forEach((entry: any) => {
        if (entry.date !== currentDate) {
          currentDate = entry.date;
          markdown += `\n## ${currentDate}\n\n`;
        }

        const time = new Date(entry.created_at).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });

        markdown += `### ${time}`;
        if (entry.is_important) markdown += ` ⭐`;
        if (entry.is_completed) markdown += ` ✓`;
        markdown += `\n\n`;

        if (entry.labels.length > 0) {
          markdown += `*Labels: ${entry.labels.map((l: any) => l.name).join(', ')}*\n\n`;
        }

        const content = entry.content_type === 'code'
          ? `\`\`\`\n${entry.content}\n\`\`\`\n`
          : entry.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        markdown += `${content}\n\n`;
        markdown += `---\n\n`;
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-entries-${format(new Date(), 'yyyy-MM-dd')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    if (!report) return;

    const completedEntries = report.entries.filter(e => e.is_completed);
    const inProgressEntries = report.entries.filter(e => !e.is_completed);

    let markdown = `# Weekly Report\n\n`;
    markdown += `**Week:** ${report.week_start} to ${report.week_end}\n\n`;
    markdown += `**Generated:** ${new Date(report.generated_at).toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    if (report.entries.length === 0) {
      markdown += `No entries marked for report this week.\n`;
    } else {
      // Completed section
      markdown += `## ✓ Completed\n\n`;
      if (completedEntries.length === 0) {
        markdown += `*No completed items*\n\n`;
      } else {
        let currentDate = '';
        completedEntries.forEach(entry => {
          if (entry.date !== currentDate) {
            currentDate = entry.date;
            markdown += `\n### ${currentDate}\n\n`;
          }

          const content = entry.content_type === 'code'
            ? `\`\`\`\n${entry.content}\n\`\`\`\n`
            : entry.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

          markdown += `${content}\n\n`;

          if (entry.labels.length > 0) {
            markdown += `*Labels: ${entry.labels.map(l => l.name).join(', ')}*\n\n`;
          }
        });
      }

      // In Progress section
      markdown += `\n## ⚙ In Progress\n\n`;
      if (inProgressEntries.length === 0) {
        markdown += `*No items in progress*\n\n`;
      } else {
        let currentDate = '';
        inProgressEntries.forEach(entry => {
          if (entry.date !== currentDate) {
            currentDate = entry.date;
            markdown += `\n### ${currentDate}\n\n`;
          }

          const content = entry.content_type === 'code'
            ? `\`\`\`\n${entry.content}\n\`\`\`\n`
            : entry.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

          markdown += `${content}\n\n`;

          if (entry.labels.length > 0) {
            markdown += `*Labels: ${entry.labels.map(l => l.name).join(', ')}*\n\n`;
          }
        });
      }
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weekly-report-${report.week_start}-to-${report.week_end}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const copySection = async (section: 'completed' | 'in-progress') => {
    if (!report) return;

    const entries = section === 'completed' 
      ? report.entries.filter(e => e.is_completed)
      : report.entries.filter(e => !e.is_completed);

    let text = section === 'completed' ? '✓ Completed\n\n' : '⚙ In Progress\n\n';
    
    if (entries.length === 0) {
      text += `No ${section === 'completed' ? 'completed' : 'in progress'} items\n`;
    } else {
      let currentDate = '';
      entries.forEach(entry => {
        if (entry.date !== currentDate) {
          currentDate = entry.date;
          text += `\n${currentDate}\n\n`;
        }

        const content = entry.content_type === 'code'
          ? entry.content
          : stripHtml(entry.content);

        text += `${content}\n\n`;

        if (entry.labels.length > 0) {
          text += `Labels: ${entry.labels.map(l => l.name).join(', ')}\n\n`;
        }
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const copyAllEntriesReport = async () => {
    if (!allEntriesReport) return;

    let text = `All Entries Report\n\n`;
    text += `Total Entries: ${allEntriesReport.entries.length}\n\n`;
    text += `${'='.repeat(60)}\n\n`;

    if (allEntriesReport.entries.length === 0) {
      text += `No entries found.\n`;
    } else {
      let currentDate = '';
      allEntriesReport.entries.forEach((entry: any) => {
        if (entry.date !== currentDate) {
          currentDate = entry.date;
          text += `\n${currentDate}\n${'='.repeat(60)}\n\n`;
        }

        const time = new Date(entry.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        text += `${time}`;
        if (entry.is_important) text += ` ⭐`;
        if (entry.is_completed) text += ` ✓`;
        text += `\n`;

        if (entry.labels.length > 0) {
          text += `Labels: ${entry.labels.map((l: any) => l.name).join(', ')}\n`;
        }

        text += `\n`;

        const content = entry.content_type === 'code'
          ? entry.content
          : stripHtml(entry.content);

        text += `${content}\n\n`;
        text += `${'-'.repeat(60)}\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAllReport(true);
      setTimeout(() => setCopiedAllReport(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Generate reports from entries marked with "Add to Report". Reports run from Wednesday to Wednesday.
          </p>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => generateReport()}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Calendar className="h-5 w-5" />
              {loading ? 'Generating...' : 'Generate This Week'}
            </button>

            {weeks.length > 0 && (
              <select
                value={selectedWeek}
                onChange={(e) => {
                  setSelectedWeek(e.target.value);
                  if (e.target.value) {
                    generateReport(e.target.value);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a past week...</option>
                {weeks.map((week) => (
                  <option key={week.start} value={week.start}>
                    {week.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {report && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Report: {report.week_start} to {report.week_end}
                </h2>
                <p className="text-sm text-gray-500">
                  {report.entries.length} {report.entries.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Export as Markdown
              </button>
            </div>

            <div className="space-y-8 mt-6">
              {report.entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No entries marked for report this week.
                  <br />
                  Check the "Add to Report" box on entries you want to include.
                </div>
              ) : (
                <>
                  {/* Completed Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                        <span className="text-2xl">✓</span> Completed
                      </h3>
                      <button
                        onClick={() => copySection('completed')}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        title="Copy completed section"
                      >
                        {copiedSection === 'completed' ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Section
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {report.entries.filter(e => e.is_completed).length === 0 ? (
                        <div className="text-gray-500 italic pl-4">No completed items</div>
                      ) : (
                        report.entries.filter(e => e.is_completed).map((entry, index, arr) => (
                          <div key={`${entry.date}-${entry.entry_id}`} className="border-l-4 border-green-500 pl-4">
                            {(index === 0 || entry.date !== arr[index - 1].date) && (
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {entry.date}
                              </h4>
                            )}
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-2">
                              {entry.content_type === 'code' ? (
                                <pre className="text-sm bg-gray-900 text-white p-3 rounded overflow-x-auto">
                                  <code>{entry.content}</code>
                                </pre>
                              ) : (
                                <div 
                                  className="prose max-w-none"
                                  dangerouslySetInnerHTML={{ __html: entry.content }}
                                />
                              )}
                            </div>

                            {entry.labels.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {entry.labels.map((label) => (
                                  <span
                                    key={label.name}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: label.color }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* In Progress Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        <span className="text-2xl">⚙</span> In Progress
                      </h3>
                      <button
                        onClick={() => copySection('in-progress')}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Copy in progress section"
                      >
                        {copiedSection === 'in-progress' ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Section
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {report.entries.filter(e => !e.is_completed).length === 0 ? (
                        <div className="text-gray-500 italic pl-4">No items in progress</div>
                      ) : (
                        report.entries.filter(e => !e.is_completed).map((entry, index, arr) => (
                          <div key={`${entry.date}-${entry.entry_id}`} className="border-l-4 border-blue-500 pl-4">
                            {(index === 0 || entry.date !== arr[index - 1].date) && (
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {entry.date}
                              </h4>
                            )}
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-2">
                              {entry.content_type === 'code' ? (
                                <pre className="text-sm bg-gray-900 text-white p-3 rounded overflow-x-auto">
                                  <code>{entry.content}</code>
                                </pre>
                              ) : (
                                <div 
                                  className="prose max-w-none"
                                  dangerouslySetInnerHTML={{ __html: entry.content }}
                                />
                              )}
                            </div>

                            {entry.labels.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {entry.labels.map((label) => (
                                  <span
                                    key={label.name}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: label.color }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* All Entries Report Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">All Entries Report</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Generate a complete report of ALL entries ever created (not filtered by date or "Add to Report" checkbox).
          </p>

          <div className="flex gap-4 items-end mb-4">
            <button
              onClick={generateAllEntriesReport}
              disabled={loadingAll}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAll ? 'Generating...' : 'Generate All Entries Report'}
            </button>

            {allEntriesReport && (
              <>
                <button
                  onClick={copyAllEntriesReport}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    copiedAllReport
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {copiedAllReport ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={exportAllEntriesReport}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>

        {allEntriesReport && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                All Entries
              </h3>
              <p className="text-sm text-gray-500">
                {allEntriesReport.entries.length} {allEntriesReport.entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>

            {allEntriesReport.entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No entries found.
              </div>
            ) : (
              <div className="space-y-4">
                {allEntriesReport.entries.map((entry: any) => (
                  <div key={entry.entry_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900">{entry.date}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          {entry.content_type === 'code' && (
                            <span className="px-2 py-0.5 bg-gray-800 text-white text-xs rounded">Code</span>
                          )}
                          {entry.is_important && <span title="Important">⭐</span>}
                          {entry.is_completed && <span title="Completed">✓</span>}
                        </div>

                        {entry.labels.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-2">
                            {entry.labels.map((label: any) => (
                              <span
                                key={label.name}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: label.color }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {entry.content_type === 'code' ? (
                      <pre className="text-sm bg-gray-900 text-white p-3 rounded overflow-x-auto">
                        <code>{entry.content}</code>
                      </pre>
                    ) : (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

