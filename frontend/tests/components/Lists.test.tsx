import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
}));

// Helper to create a proper drag event with dataTransfer
function createDragEvent(type: string, dataTransfer?: Partial<DataTransfer>) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as any;
  event.dataTransfer = {
    dropEffect: 'none',
    effectAllowed: 'all',
    files: [],
    items: [],
    types: [],
    clearData: vi.fn(),
    getData: vi.fn((format: string) => dataTransfer?.getData?.(format) || ''),
    setData: vi.fn((format: string, data: string) => {
      if (!event.dataTransfer.types.includes(format)) {
        event.dataTransfer.types.push(format);
      }
    }),
    setDragImage: vi.fn(),
    ...dataTransfer,
  };
  return event;
}

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
  });

  describe('Drag and Drop - List Reordering', () => {
    it('should reorder lists when dragged from first to last position', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      // Wait for lists to load
      await waitFor(() => {
        expect(screen.getByText('List A')).toBeInTheDocument();
      });

      // Get draggable elements using stable test IDs
      const headerA = screen.getByTestId('list-header-1');
      const columnC = screen.getByTestId('list-column-3');
      const containerC = columnC.parentElement!;

      // Simulate drag: List A to List C position
      const dragStartEvent = createDragEvent('dragstart');
      headerA.dispatchEvent(dragStartEvent);
      dragStartEvent.dataTransfer.setData('text/x-listid', '1');

      const dragOverEvent = createDragEvent('dragover', {
        getData: (format: string) => format === 'text/x-listid' ? '1' : '',
        types: ['text/x-listid'],
      });
      containerC.dispatchEvent(dragOverEvent);

      const dropEvent = createDragEvent('drop', {
        getData: (format: string) => format === 'text/x-listid' ? '1' : '',
        types: ['text/x-listid'],
      });
      containerC.dispatchEvent(dropEvent);

      const dragEndEvent = createDragEvent('dragend');
      headerA.dispatchEvent(dragEndEvent);

      // Verify reorderLists API was called with correct order: B, C, A
      await waitFor(() => {
        expect(api.listsApi.reorderLists).toHaveBeenCalledWith([
          { id: 2, order_index: 0 }, // List B first
          { id: 3, order_index: 1 }, // List C second
          { id: 1, order_index: 2 }, // List A last
        ]);
      });

      // Verify optimistic UI update
      const listColumns = screen.getAllByTestId(/list-column-/);
      expect(listColumns[0]).toHaveAttribute('data-testid', 'list-column-2'); // B
      expect(listColumns[1]).toHaveAttribute('data-testid', 'list-column-3'); // C
      expect(listColumns[2]).toHaveAttribute('data-testid', 'list-column-1'); // A
    });

    it('should reorder lists when dragged to middle position', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('List C')).toBeInTheDocument();
      });

      // Drag List C to List A position (C moves to first)
      const headerC = screen.getByTestId('list-header-3');
      const columnA = screen.getByTestId('list-column-1');
      const containerA = columnA.parentElement!;

      const dragStartEvent = createDragEvent('dragstart');
      headerC.dispatchEvent(dragStartEvent);
      dragStartEvent.dataTransfer.setData('text/x-listid', '3');

      const dropEvent = createDragEvent('drop', {
        getData: (format: string) => format === 'text/x-listid' ? '3' : '',
        types: ['text/x-listid'],
      });
      containerA.dispatchEvent(dropEvent);

      const dragEndEvent = createDragEvent('dragend');
      headerC.dispatchEvent(dragEndEvent);

      // Verify reorderLists API was called with correct order: C, A, B
      await waitFor(() => {
        expect(api.listsApi.reorderLists).toHaveBeenCalledWith([
          { id: 3, order_index: 0 }, // List C first
          { id: 1, order_index: 1 }, // List A second
          { id: 2, order_index: 2 }, // List B last
        ]);
      });
    });

    it('should not reorder if dropped on same position', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('List A')).toBeInTheDocument();
      });

      const headerA = screen.getByTestId('list-header-1');
      const columnA = screen.getByTestId('list-column-1');
      const containerA = columnA.parentElement!;

      // Drag and drop on itself
      const dragStartEvent = createDragEvent('dragstart');
      headerA.dispatchEvent(dragStartEvent);
      dragStartEvent.dataTransfer.setData('text/x-listid', '1');

      const dropEvent = createDragEvent('drop', {
        getData: (format: string) => format === 'text/x-listid' ? '1' : '',
        types: ['text/x-listid'],
      });
      containerA.dispatchEvent(dropEvent);

      const dragEndEvent = createDragEvent('dragend');
      headerA.dispatchEvent(dragEndEvent);

      // Should not call API when dropped on same position
      await waitFor(() => {
        expect(api.listsApi.reorderLists).not.toHaveBeenCalled();
      });
    });

    it('should show visual feedback during drag', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('List A')).toBeInTheDocument();
      });

      const headerA = screen.getByTestId('list-header-1');
      const columnA = screen.getByTestId('list-column-1');
      const containerA = columnA.parentElement as HTMLElement;

      // Check initial state
      expect(containerA.style.opacity).toBe('');

      // Start dragging
      const dragStartEvent = createDragEvent('dragstart');
      headerA.dispatchEvent(dragStartEvent);

      // Should have reduced opacity when dragging
      await waitFor(() => {
        expect(containerA.style.opacity).toBe('0.5');
      });
    });

    it('should reset visual state when drag is cancelled', async () => {
      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('List A')).toBeInTheDocument();
      });

      const headerA = screen.getByTestId('list-header-1');
      const columnA = screen.getByTestId('list-column-1');
      const containerA = columnA.parentElement as HTMLElement;

      // Start dragging
      const dragStartEvent = createDragEvent('dragstart');
      headerA.dispatchEvent(dragStartEvent);

      await waitFor(() => {
        expect(containerA.style.opacity).toBe('0.5');
      });

      // Cancel drag
      const dragEndEvent = createDragEvent('dragend');
      headerA.dispatchEvent(dragEndEvent);

      // Should reset opacity
      await waitFor(() => {
        expect(containerA.style.opacity).toBe('1');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API failure when reordering lists', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.listsApi.reorderLists).mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <Lists />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('List A')).toBeInTheDocument();
      });

      const headerA = screen.getByTestId('list-header-1');
      const columnC = screen.getByTestId('list-column-3');
      const containerC = columnC.parentElement!;

      // Attempt drag and drop
      const dragStartEvent = createDragEvent('dragstart');
      headerA.dispatchEvent(dragStartEvent);
      dragStartEvent.dataTransfer.setData('text/x-listid', '1');

      const dropEvent = createDragEvent('drop', {
        getData: (format: string) => format === 'text/x-listid' ? '1' : '',
        types: ['text/x-listid'],
      });
      containerC.dispatchEvent(dropEvent);

      const dragEndEvent = createDragEvent('dragend');
      headerA.dispatchEvent(dragEndEvent);

      // Should reload lists after error
      await waitFor(() => {
        expect(api.listsApi.getAll).toHaveBeenCalledTimes(2); // Initial load + reload after error
      });

      consoleErrorSpy.mockRestore();
    });

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
  });
});
