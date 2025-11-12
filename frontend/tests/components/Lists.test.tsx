import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Lists from '../../src/components/Lists';
import * as api from '../../src/api';

// Mock the API
vi.mock('../../src/api', () => ({
  listsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addEntry: vi.fn(),
    removeEntry: vi.fn(),
    reorderEntries: vi.fn(),
    reorderLists: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <div>Plus</div>,
  X: () => <div>X</div>,
  Trash2: () => <div>Trash2</div>,
  Archive: () => <div>Archive</div>,
  GripVertical: () => <div>GripVertical</div>,
  PlusCircle: () => <div>PlusCircle</div>,
  Edit2: () => <div>Edit2</div>,
  Calendar: () => <div>Calendar</div>,
  Search: () => <div>Search</div>,
  Clock: () => <div>Clock</div>,
  ExternalLink: () => <div>ExternalLink</div>,
}));

// Mock child components to avoid their dependencies
vi.mock('../../src/components/ListCard', () => ({
  default: ({ entry }: any) => (
    <div data-testid={`list-card-${entry.id}`}>{entry.title || 'Entry'}</div>
  ),
}));

vi.mock('../../src/components/AddEntryToListModal', () => ({
  default: () => <div>AddEntryToListModal</div>,
}));

vi.mock('../../src/components/CreateEntryModal', () => ({
  default: () => <div>CreateEntryModal</div>,
}));

describe('Lists Component', () => {
  const mockLists = [
    {
      id: 1,
      name: 'List A',
      description: 'First list',
      color: '#ff0000',
      order_index: 0,
      is_archived: false,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      entries: [],
    },
    {
      id: 2,
      name: 'List B',
      description: 'Second list',
      color: '#00ff00',
      order_index: 1,
      is_archived: false,
      created_at: '2025-01-02',
      updated_at: '2025-01-02',
      entries: [],
    },
    {
      id: 3,
      name: 'List C',
      description: 'Third list',
      color: '#0000ff',
      order_index: 2,
      is_archived: false,
      created_at: '2025-01-03',
      updated_at: '2025-01-03',
      entries: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listsApi.getAll).mockResolvedValue(mockLists);
    vi.mocked(api.listsApi.getById).mockImplementation((id) =>
      Promise.resolve(mockLists.find((l) => l.id === id) as any)
    );
    vi.mocked(api.listsApi.reorderLists).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render lists in correct order', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('List A')).toBeInTheDocument();
        expect(screen.getByText('List B')).toBeInTheDocument();
        expect(screen.getByText('List C')).toBeInTheDocument();
      });

      // Verify order using data-testid
      const listColumns = screen.getAllByTestId(/list-column-/);
      expect(listColumns).toHaveLength(3);
      expect(listColumns[0]).toHaveAttribute('data-testid', 'list-column-1');
      expect(listColumns[1]).toHaveAttribute('data-testid', 'list-column-2');
      expect(listColumns[2]).toHaveAttribute('data-testid', 'list-column-3');
    });

    it('should display empty state when no lists exist', async () => {
      vi.mocked(api.listsApi.getAll).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no lists yet/i)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      // Component should render without crashing during loading
      expect(screen.queryByText('List A')).not.toBeInTheDocument();
    });

    it('should render list headers with correct test IDs', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('list-header-1')).toBeInTheDocument();
        expect(screen.getByTestId('list-header-2')).toBeInTheDocument();
        expect(screen.getByTestId('list-header-3')).toBeInTheDocument();
      });

      // Verify headers are draggable
      const header1 = screen.getByTestId('list-header-1');
      expect(header1).toHaveAttribute('draggable', 'true');
    });
  });

  describe('API Integration', () => {
    it('should call getAll API on mount', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(api.listsApi.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it('should call getById for each list to fetch entries', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(api.listsApi.getById).toHaveBeenCalledWith(1);
        expect(api.listsApi.getById).toHaveBeenCalledWith(2);
        expect(api.listsApi.getById).toHaveBeenCalledWith(3);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API failure when loading lists', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.listsApi.getAll).mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      // Should not crash, component should handle error gracefully
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle API failure when loading individual list', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.listsApi.getById).mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      // When getById fails, the whole loadLists fails and shows error state
      await waitFor(() => {
        expect(screen.getByText('Failed to load lists')).toBeInTheDocument();
      });

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
