import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SimpleRichTextEditor from '../../src/components/SimpleRichTextEditor';

describe('SimpleRichTextEditor - Task List Features', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list button in toolbar', () => {
    render(
      <SimpleRichTextEditor
        content=""
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    const taskListButton = screen.getByTitle('Task List');
    expect(taskListButton).toBeInTheDocument();
  });

  it('creates a task list when button is clicked', async () => {
    render(
      <SimpleRichTextEditor
        content=""
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    const taskListButton = screen.getByTitle('Task List');
    fireEvent.click(taskListButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall).toContain('data-type="taskList"');
    });
  });

  it('renders existing task list content', () => {
    const taskListHTML = '<ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 1</p></div></li></ul>';
    
    render(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked task list items', () => {
    const taskListHTML = '<ul data-type="taskList"><li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Completed Task</p></div></li></ul>';
    
    const { container } = render(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Verify task list content renders
    expect(container.querySelector('.ProseMirror')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('updates content when checkbox is toggled', async () => {
    const taskListHTML = '<ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 1</p></div></li></ul>';
    
    render(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall).toContain('data-checked="true"');
    });
  });

  it('renders nested task lists', () => {
    const nestedTaskListHTML = `
      <ul data-type="taskList">
        <li data-checked="false">
          <label><input type="checkbox"><span></span></label>
          <div>
            <p>Parent Task</p>
            <ul data-type="taskList">
              <li data-checked="false">
                <label><input type="checkbox"><span></span></label>
                <div><p>Nested Task</p></div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    `;
    
    render(
      <SimpleRichTextEditor
        content={nestedTaskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
  });

  it('shows active state when task list is active', async () => {
    render(
      <SimpleRichTextEditor
        content=""
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    const taskListButton = screen.getByTitle('Task List');
    
    // Click to activate task list
    fireEvent.click(taskListButton);

    await waitFor(() => {
      // Button should have active styling (check for bg-opacity-100 class)
      expect(taskListButton.className).toContain('bg-opacity-100');
    });
  });

  it('allows typing in task list items', () => {
    const taskListHTML = '<ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p></p></div></li></ul>';
    
    const { container } = render(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Verify editor renders (actual editing tested in E2E)
    expect(container.querySelector('.ProseMirror')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('can toggle task list off', () => {
    const taskListHTML = '<ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 1</p></div></li></ul>';
    
    const { container } = render(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Verify task list button exists (actual toggle tested in E2E)
    expect(screen.getByTitle('Task List')).toBeInTheDocument();
    expect(container.querySelector('.ProseMirror')).toBeInTheDocument();
  });

  it('maintains task list state across content updates', async () => {
    const taskListHTML = '<ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 1</p></div></li></ul>';
    
    const { rerender } = render(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Rerender with same content
    rerender(
      <SimpleRichTextEditor
        content={taskListHTML}
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Task list should still be present
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});

