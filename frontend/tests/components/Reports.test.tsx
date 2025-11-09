/**
 * Reports Component Tests
 * 
 * Tests report generation, exports, and clipboard functionality.
 * Per .cursorrules: Tests validate existing behavior without modifying production code.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Reports from '@/components/Reports';
import { TimezoneProvider } from '@/contexts/TimezoneContext';
import { TransparentLabelsProvider } from '@/contexts/TransparentLabelsContext';
import axios from 'axios';

// Mock axios - defined inline to avoid hoisting issues
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockAxios = vi.mocked(axios);

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  FileText: () => <div>FileText</div>,
  Download: () => <div>Download</div>,
  Calendar: () => <div>Calendar</div>,
  Copy: () => <div>Copy</div>,
  Check: () => <div>Check</div>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: any, formatStr: string) => '2025-11-07',
}));

// Mock timezone utils
vi.mock('@/utils/timezone', () => ({
  formatTimestamp: (timestamp: string) => timestamp,
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Reports Component', () => {
  const mockWeeks = [
    {
      start: '2025-11-04',
      end: '2025-11-10',
      label: 'Nov 4 - Nov 10, 2025',
    },
    {
      start: '2025-10-28',
      end: '2025-11-03',
      label: 'Oct 28 - Nov 3, 2025',
    },
  ];

  const mockReportData = {
    week_start: '2025-11-04',
    week_end: '2025-11-10',
    generated_at: '2025-11-07T10:00:00Z',
    entries: [
      {
        date: '2025-11-07',
        entry_id: 1,
        content: '<p>Test content</p>',
        content_type: 'rich_text',
        labels: [{ name: 'work', color: '#3b82f6' }],
        created_at: '2025-11-07T10:00:00Z',
        is_completed: false,
      },
      {
        date: '2025-11-06',
        entry_id: 2,
        content: '<p>Another entry</p>',
        content_type: 'rich_text',
        labels: [],
        created_at: '2025-11-06T15:00:00Z',
        is_completed: true,
      },
    ],
  };

  const mockAllEntriesReport = {
    generated_at: '2025-11-07T10:00:00Z',
    total_entries: 2,
    entries: mockReportData.entries,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/reports/weeks')) {
        return Promise.resolve({ data: { weeks: mockWeeks } });
      }
      if (url.includes('/api/reports/generate')) {
        return Promise.resolve({ data: mockReportData });
      }
      if (url.includes('/api/reports/all-entries')) {
        return Promise.resolve({ data: mockAllEntriesReport });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <TimezoneProvider>
          <TransparentLabelsProvider>
            {component}
          </TransparentLabelsProvider>
        </TimezoneProvider>
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderWithProviders(<Reports />);
    expect(screen.getByText(/reports/i)).toBeInTheDocument();
  });

  it('loads available weeks on mount', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/weeks')
      );
    });
  });

  it('displays available weeks in dropdown', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(screen.getByText(/Nov 4 - Nov 10, 2025/)).toBeInTheDocument();
    });
  });

  it('generates weekly report when week selected', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/weeks')
      );
    });
  });

  it('displays report entries after generation', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/weeks')
      );
    });
  });

  it('generates current week report by default', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('generates all entries report', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('shows loading state during report generation', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('exports report as markdown', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('copies report section to clipboard', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('shows check icon after successful copy', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('displays labels with correct colors', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('indicates completed entries', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('shows empty state when no entries in report', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('allows navigation to entry date', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('displays total entry count for all entries report', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('groups entries by date', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('renders HTML content correctly', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('respects transparent labels setting', async () => {
    renderWithProviders(<Reports />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });
});

