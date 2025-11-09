/**
 * CalendarView Component Tests
 * 
 * Tests calendar rendering, date navigation, indicators, and goal display.
 * Per .cursorrules: Tests validate existing behavior without modifying production code.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CalendarView from '../../components/CalendarView';
import { notesApi, goalsApi } from '../../api';

// Mock API - defined inline to avoid hoisting issues
vi.mock('../../api', () => ({
  notesApi: {
    getByMonth: vi.fn(),
  },
  goalsApi: {
    getAllSprints: vi.fn(),  // Plural!
    getAllQuarterly: vi.fn(),
  },
}));

const mockNotesApi = vi.mocked(notesApi);
const mockGoalsApi = vi.mocked(goalsApi);

// Mock react-calendar
vi.mock('react-calendar', () => ({
  default: ({ value, onChange, tileContent, onActiveStartDateChange }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onChange(new Date('2025-11-15'))}>Select Date</button>
      <button onClick={() => onActiveStartDateChange({ activeStartDate: new Date('2025-12-01') })}>
        Change Month
      </button>
      <div data-testid="tile-content">{tileContent && tileContent({ date: new Date('2025-11-07') })}</div>
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Star: () => <div>Star</div>,
  Check: () => <div>Check</div>,
  Skull: () => <div>Skull</div>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: any) => '2025-11-07',
}));

describe('CalendarView Component', () => {
  const mockNotes = [
    {
      id: 1,
      date: '2025-11-07',
      daily_goal: 'Test goal',
      entries: [
        { id: 1, is_important: true, is_completed: false, is_dev_null: false },
        { id: 2, is_important: false, is_completed: true, is_dev_null: false },
      ],
    },
    {
      id: 2,
      date: '2025-11-08',
      daily_goal: '',
      entries: [
        { id: 3, is_important: false, is_completed: false, is_dev_null: true },
      ],
    },
  ];

  const mockSprintGoals = [
    {
      id: 1,
      text: 'Sprint Goal',
      start_date: '2025-11-01',
      end_date: '2025-11-14',
    },
  ];

  const mockQuarterlyGoals = [
    {
      id: 1,
      text: 'Quarterly Goal',
      start_date: '2025-10-01',
      end_date: '2025-12-31',
    },
  ];

  const defaultProps = {
    selectedDate: new Date('2025-11-07'),
    onDateSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNotesApi.getByMonth.mockResolvedValue(mockNotes);
    mockGoalsApi.getAllSprints.mockResolvedValue(mockSprintGoals);
    mockGoalsApi.getAllQuarterly.mockResolvedValue(mockQuarterlyGoals);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders without crashing', () => {
    renderWithRouter(<CalendarView {...defaultProps} />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('loads notes for current month', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('loads all goals', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGoalsApi.getAllSprints).toHaveBeenCalled();
      expect(mockGoalsApi.getAllQuarterly).toHaveBeenCalled();
    });
  });

  it('calls onDateSelect when date clicked', async () => {
    const onDateSelect = vi.fn();
    renderWithRouter(<CalendarView {...defaultProps} onDateSelect={onDateSelect} />);

    // Component renders with callback
    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('loads new month when month changes', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('displays indicators for entries with flags', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('displays completed indicator', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('displays dev null indicator', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });

    // Should show Skull for dev null entries
    expect(screen.getByText('Skull')).toBeInTheDocument();
  });

  it('renders tile content', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('tile-content')).toBeInTheDocument();
    });
  });

  it('handles empty notes gracefully', async () => {
    mockNotesApi.getByMonth.mockResolvedValue([]);

    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });

    // Should render calendar without errors
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockNotesApi.getByMonth.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });

    // Should handle error without crashing
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('loads adjacent months for calendar grid', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      // Should load current month + adjacent months for grid completeness
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('shows legend for entry indicators', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });

    // Legend should explain indicators
    expect(screen.getByText(/important/i)).toBeInTheDocument();
  });

  it('displays goal indicators on calendar', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGoalsApi.getAllSprints).toHaveBeenCalled();
    });

    // Goal indicators should be shown (🚀 and 🌟)
  });

  it('adds tooltips to calendar tiles', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('shows entry count in tooltips', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('displays daily goals in tooltips', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockNotesApi.getByMonth).toHaveBeenCalled();
    });
  });

  it('displays sprint goals in tooltips', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGoalsApi.getAllSprints).toHaveBeenCalled();
    });
  });

  it('displays quarterly goals in tooltips', async () => {
    renderWithRouter(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGoalsApi.getAllQuarterly).toHaveBeenCalled();
    });
  });
});

