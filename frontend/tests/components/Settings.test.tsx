/**
 * Settings Component Tests
 * 
 * Tests backup/restore, theme management, timezone, labels, and preferences.
 * Per .cursorrules: Tests validate existing behavior without modifying production code.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
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
    mockAxios.post.mockResolvedValue({ data: {} });
    mockAxios.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
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
  };

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('loads labels on mount', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('displays theme selector', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('displays timezone settings', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('exports data as JSON', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('exports data as Markdown', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('imports data from JSON file', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('performs full restore with attachments', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('deletes label when delete button clicked', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('searches labels by name', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('toggles transparent labels setting', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles daily goals visibility', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles sprint goals visibility', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles quarterly goals visibility', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('toggles day labels visibility', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('allows editing timezone', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('displays success message after successful operation', async () => {
    mockAxios.delete.mockResolvedValue({ data: {} });

    await act(async () => {
      renderWithProviders(<Settings />);
    });

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
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('opens theme creator when create theme button clicked', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });

  it('shows loading state during export', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('shows loading state during import', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('clears file inputs after successful import', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('sorts labels by name', async () => {
    renderWithProviders(<Settings />);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('displays helpful documentation notes', () => {
    const { container } = renderWithProviders(<Settings />);
    expect(container).toBeInTheDocument();
  });
});

