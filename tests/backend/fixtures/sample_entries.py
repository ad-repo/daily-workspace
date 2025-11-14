"""Sample entries fixture data for testing."""
from datetime import datetime, timedelta


def get_sample_entries_data():
    """
    Returns 20 sample entries with various states, labels, and dates.
    """
    base_date = datetime(2025, 11, 1)
    entries = []

    for i in range(20):
        date_offset = i // 4  # 4 entries per day
        entry_date = base_date + timedelta(days=date_offset)

        entry = {
            'date': entry_date.strftime('%Y-%m-%d'),
            'title': f'Sample Entry {i+1}',
            'content': f'<p>This is sample content for entry {i+1}.</p><p>It contains <strong>rich text</strong> formatting.</p>',
            'content_type': 'rich_text',
            'is_important': 1 if i % 3 == 0 else 0,
            'is_completed': 1 if i % 4 == 0 else 0,
            'include_in_report': 1 if i % 5 == 0 else 0,
            'order_index': i % 4,
        }
        entries.append(entry)

    return entries


def get_code_entry_data():
    """Returns a sample code entry."""
    return {
        'date': '2025-11-07',
        'title': 'Code Snippet',
        'content': """<pre><code>def hello_world():
    print("Hello, World!")
    return True</code></pre>""",
        'content_type': 'rich_text',
        'is_important': 0,
        'is_completed': 0,
        'include_in_report': 0,
        'order_index': 0,
    }


def get_markdown_entry_data():
    """Returns a sample entry with markdown-like content."""
    return {
        'date': '2025-11-07',
        'title': 'Markdown Entry',
        'content': """<h2>Heading</h2>
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>
<p>Paragraph with <em>emphasis</em> and <code>inline code</code>.</p>""",
        'content_type': 'rich_text',
        'is_important': 1,
        'is_completed': 0,
        'include_in_report': 1,
        'order_index': 1,
    }
