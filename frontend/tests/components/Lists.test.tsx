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
}));

// Mock ListColumn component
vi.mock('../../src/components/ListColumn', () => ({
  default: ({ list }: any) => (
    <div data-testid={`list-column-${list.id}`}>
      {list.name}
    </div>
  ),
}));

describe('Lists Drag and Drop', () => {
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

  it('should render lists in order', async () => {
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
  });

  it('should reorder lists when dragged and dropped', async () => {
    render(
      <BrowserRouter>
        <Lists />
      </BrowserRouter>
    );

    // Wait for lists to load
    await waitFor(() => {
      expect(screen.getByText('List A')).toBeInTheDocument();
      expect(screen.getByText('List B')).toBeInTheDocument();
      expect(screen.getByText('List C')).toBeInTheDocument();
    });

    // Get all list columns
    let listColumns = screen.getAllByTestId(/list-column-/);
    expect(listColumns).toHaveLength(3);
    
    // Initial order should be A, B, C (IDs 1, 2, 3)
    expect(listColumns[0]).toHaveAttribute('data-testid', 'list-column-1');
    expect(listColumns[1]).toHaveAttribute('data-testid', 'list-column-2');
    expect(listColumns[2]).toHaveAttribute('data-testid', 'list-column-3');

    // Get the draggable header for List A and the container for List C
    const draggableA = listColumns[0].querySelector('[draggable]');
    const listCContainer = listColumns[2].parentElement;

    expect(draggableA).not.toBeNull();
    expect(listCContainer).not.toBeNull();

    // Simulate drag and drop: drag List A to List C position (A moves to end)
    fireEvent.dragStart(draggableA!);
    fireEvent.dragOver(listCContainer!);
    fireEvent.drop(listCContainer!);
    fireEvent.dragEnd(draggableA!);

    // Verify reorderLists API was called with correct order: B, C, A
    await waitFor(() => {
      expect(api.listsApi.reorderLists).toHaveBeenCalledWith([
        { id: 2, order_index: 0 }, // List B first
        { id: 3, order_index: 1 }, // List C second
        { id: 1, order_index: 2 }, // List A last
      ]);
    });

    // Verify the DOM order changed immediately (optimistic update)
    listColumns = screen.getAllByTestId(/list-column-/);
    expect(listColumns[0]).toHaveAttribute('data-testid', 'list-column-2'); // B
    expect(listColumns[1]).toHaveAttribute('data-testid', 'list-column-3'); // C
    expect(listColumns[2]).toHaveAttribute('data-testid', 'list-column-1'); // A
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

    const listAColumn = screen.getByTestId('list-column-1');
    const draggableHeader = listAColumn.querySelector('[draggable]') as HTMLElement;
    const listAContainer = listAColumn.parentElement as HTMLElement;

    // Check initial opacity
    expect(listAContainer.style.opacity).toBe('');

    // Start dragging
    fireEvent.dragStart(draggableHeader);

    // Should have reduced opacity when dragging
    await waitFor(() => {
      expect(listAContainer.style.opacity).toBe('0.5');
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

    const listAColumn = screen.getByTestId('list-column-1');
    const draggableHeader = listAColumn.querySelector('[draggable]') as HTMLElement;
    const listAContainer = listAColumn.parentElement;

    // Drag and drop on itself
    fireEvent.dragStart(draggableHeader);
    fireEvent.drop(listAContainer!);
    fireEvent.dragEnd(draggableHeader);

    // Should not call API
    expect(api.listsApi.reorderLists).not.toHaveBeenCalled();
  });

  it('should handle drag cancel', async () => {
    render(
      <BrowserRouter>
        <Lists />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('List A')).toBeInTheDocument();
    });

    // Get the draggable header for List A
    const listAColumn = screen.getByTestId('list-column-1');
    const draggableHeader = listAColumn.querySelector('[draggable]') as HTMLElement;
    const listAContainer = listAColumn.parentElement as HTMLElement;

    // Start dragging
    fireEvent.dragStart(draggableHeader);
    expect(listAContainer.style.opacity).toBe('0.5');

    // Cancel drag
    fireEvent.dragEnd(draggableHeader);

    // Should reset opacity
    await waitFor(() => {
      expect(listAContainer.style.opacity).toBe('1');
    });
  });
});

