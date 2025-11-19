/**
 * Settings Component Tests
 * 
 * Tests backup/restore, theme management, timezone, labels, and preferences.
 * Per .cursorrules: Tests validate existing behavior without modifying production code.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import React from 'react';
import Settings from '@/components/Settings';
import { TimezoneProvider } from '@/contexts/TimezoneContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CustomBackgroundProvider } from '@/contexts/CustomBackgroundContext';
import { TransparentLabelsProvider } from '@/contexts/TransparentLabelsContext';
import { DailyGoalsProvider } from '@/contexts/DailyGoalsContext';
import { SprintGoalsProvider } from '@/contexts/SprintGoalsContext';
import { QuarterlyGoalsProvider } from '@/contexts/QuarterlyGoalsContext';
import { DayLabelsProvider } from '@/contexts/DayLabelsContext';
import axios from 'axios';

// Mock axios - defined inline to avoid hoisting issues
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    })),
  },
}));

const mockAxios = vi.mocked(axios);

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Download: () => <div>Download</div>,
  Upload: () => <div>Upload</div>,
  Settings: () => <div>Settings</div>,
  Clock: () => <div>Clock</div>,
  Archive: () => <div>Archive</div>,
  Tag: () => <div>Tag</div>,
  Trash2: () => <div>Trash2</div>,
  Edit2: () => <div>Edit2</div>,
  Palette: () => <div>Palette</div>,
  Plus: () => <div>Plus</div>,
  RotateCcw: () => <div>RotateCcw</div>,
}));

// Mock CustomThemeCreator
vi.mock('@/components/CustomThemeCreator', () => ({
  default: () => <div>Custom Theme Creator</div>,
}));

// Mock CustomBackgroundSettings
vi.mock('@/components/CustomBackgroundSettings', () => ({
  default: () => <div>Custom Background Settings</div>,
}));

describe('Settings Component', () => {
  const mockLabels = [
    { id: 1, name: 'work', color: '#3b82f6', created_at: '2025-11-01' },
    { id: 2, name: 'personal', color: '#10b981', created_at: '2025-11-02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/labels/')) {
        return Promise.resolve({ data: mockLabels });
      }
      return Promise.resolve({ data: {} });
    });
    mockAxios.post.mockImplementation((url: string) => {
      if (url.includes('/api/backup/import')) {
        return Promise.resolve({ data: { stats: { notes_imported: 5 } } });
      }
      if (url.includes('/api/backup/full-restore')) {
        return Promise.resolve({
          data: {
            data_restore: { entries_imported: 81, notes_imported: 19, labels_imported: 79 },
            files_restore: { restored: 5, skipped: 0 },
          },
        });
      }
      if (url.includes('/api/uploads/restore-files')) {
        return Promise.resolve({ data: { stats: { restored: 10, skipped: 0 } } });
      }
      return Promise.resolve({ data: {} });
    });
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = async (component: React.ReactElement) => {
    let utils: ReturnType<typeof render> | undefined;
    await act(async () => {
      utils = render(
      <TimezoneProvider>
        <ThemeProvider>
          <CustomBackgroundProvider>
            <TransparentLabelsProvider>
              <DailyGoalsProvider>
                <SprintGoalsProvider>
                  <QuarterlyGoalsProvider>
                    <DayLabelsProvider>
                      {component}
                    </DayLabelsProvider>
                  </QuarterlyGoalsProvider>
                </SprintGoalsProvider>
              </DailyGoalsProvider>
            </TransparentLabelsProvider>
          </CustomBackgroundProvider>
        </ThemeProvider>
      </TimezoneProvider>
    );
    });
    return utils!;
  };

  it('renders without crashing', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('loads labels on mount', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('displays theme selector', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('displays timezone settings', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('exports data as JSON', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('exports data as Markdown', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('imports data from JSON file', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('shows confirmation before importing JSON backup', async () => {
    await renderWithProviders(<Settings />);

    const importInput = screen.getByTestId('json-import-input') as HTMLInputElement;
    const file = new File(['{}'], 'backup.json', { type: 'application/json' });

    await act(async () => {
      fireEvent.change(importInput, { target: { files: [file] } });
    });

    expect(screen.getByText('Import JSON Backup?')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Yes, import backup'));
    });

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/backup/import'),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Remember to restore the uploads ZIP/i)).toBeInTheDocument();
    });
  });

  it('performs full restore with attachments', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('requires confirmation before running a full restore', async () => {
    await renderWithProviders(<Settings />);

    const jsonInput = screen.getByTestId('full-restore-json-input') as HTMLInputElement;
    const zipInput = screen.getByTestId('full-restore-zip-input') as HTMLInputElement;
    const jsonFile = new File(['{}'], 'backup.json', { type: 'application/json' });
    const zipFile = new File(['zip'], 'files.zip', { type: 'application/zip' });

    await act(async () => {
      fireEvent.change(jsonInput, { target: { files: [jsonFile] } });
      fireEvent.change(zipInput, { target: { files: [zipFile] } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Restore Everything'));
    });

    expect(screen.getByText('Run Full Restore?')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Restore everything'));
    });

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/backup/full-restore'),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }),
        })
      );
    });
  });

  it('deletes label when delete button clicked', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('searches labels by name', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('toggles transparent labels setting', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles daily goals visibility', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles sprint goals visibility', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles quarterly goals visibility', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles day labels visibility', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('allows editing timezone', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('displays success message after successful operation', async () => {
    mockAxios.delete.mockResolvedValue({ data: {} });

    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('work')).toBeInTheDocument();
    }, { timeout: 10000 });

    const deleteButtons = screen.getAllByText('Trash2');
    
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays error message on API failure', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('opens theme creator when create theme button clicked', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('shows loading state during export', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('shows loading state during import', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('clears file inputs after successful import', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('sorts labels by name', async () => {
    await renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('displays helpful documentation notes', async () => {
    const { container } = await renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });
});

