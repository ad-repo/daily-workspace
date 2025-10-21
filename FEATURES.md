# Features Guide 🌟

A comprehensive guide to all features in the Daily Notes app.

## 📅 Calendar View

### Overview
The calendar view provides a bird's-eye view of all your notes for the month.

### Features
- **Monthly Calendar**: Full month view with navigation
- **Visual Indicators**:
  - 🔵 **Blue dot**: Day has note entries
  - 🔥 **Fire icons**: Shows fire rating (1-5)
- **Navigation**:
  - Click arrows to move between months
  - Click any date to jump to that day's notes
- **Today Highlight**: Current day highlighted in yellow

### Use Cases
- Review your month at a glance
- Find specific notes by date
- Track which days you were most productive (fire ratings)
- Plan ahead by seeing empty days

---

## 📖 Daily View

### Overview
Focus on a single day with all its entries and details.

### Features
- **Date Display**: Large, clear date header
- **Today Badge**: Special indicator when viewing today
- **Date Navigation**:
  - ⬅️ Previous day arrow
  - ➡️ Next day arrow
- **Fire Rating Widget**: Rate your day at the top
- **Multiple Entries**: Add unlimited entry cards
- **Entry Management**:
  - Add new entries with one click
  - Each entry shows creation time
  - Delete individual entries

### Use Cases
- Daily journaling
- Record thoughts throughout the day
- Track tasks and accomplishments
- Code snippets and learning notes
- Meeting notes with timestamps

---

## ✍️ Rich Text Editor

### Text Formatting

#### Basic Formatting
- **Bold** (Ctrl/Cmd + B): `**text**`
- *Italic* (Ctrl/Cmd + I): `*text*`
- ~~Strikethrough~~: Crossed-out text
- `Inline Code`: Highlight code or technical terms

#### Structure
- **Heading 1**: Large section headers
- **Heading 2**: Subsection headers
- **Bullet Lists**: Unordered lists
- **Numbered Lists**: Ordered lists
- **Blockquotes**: Highlight important text

#### Advanced Features
- **Code Blocks**: Syntax-highlighted code with dark theme
- **Links**: Create hyperlinks to websites
- **Images**: Embed images via URL
- **Horizontal Rules**: Section dividers

### Toolbar Buttons

```
[B] [I] [S] [</>] | [H1] [H2] | [•] [1.] ["] [</>] | [🔗] [🖼️] | [↶] [↷]
```

- `B`: Bold
- `I`: Italic  
- `S`: Strikethrough
- `</>`: Inline code
- `H1`, `H2`: Headings
- `•`: Bullet list
- `1.`: Numbered list
- `"`: Blockquote
- `</>`: Code block
- `🔗`: Link
- `🖼️`: Image
- `↶`, `↷`: Undo/Redo

### Auto-Save
- Content automatically saves after 1 second of inactivity
- "Saving..." indicator shows when saving
- No need to manually save

---

## 🔥 Fire Rating System

### What is it?
Rate each day from 0-5 fires to track your best days!

### Rating Scale
- **0 fires** 🌫️: No rating
- **1 fire** 🔥: Okay day
- **2 fires** 🔥🔥: Good day
- **3 fires** 🔥🔥🔥: Great day!
- **4 fires** 🔥🔥🔥🔥: Excellent day!
- **5 fires** 🔥🔥🔥🔥🔥: On fire! Amazing day!

### How to Use
1. Click fire icons at top of daily view
2. Click same number again to remove rating
3. Rating saves immediately
4. Visible in calendar view

### Use Cases
- Track productivity levels
- Identify patterns in good/bad days
- Motivate yourself to maintain streaks
- Quick visual feedback in calendar

---

## 🎨 User Interface Features

### Modern Design
- **Clean Layout**: Minimalist, distraction-free
- **Smooth Animations**: Subtle transitions
- **Card Design**: Content organized in beautiful cards
- **Professional Typography**: Easy-to-read fonts
- **Color Scheme**: 
  - Blue primary color
  - Orange for fire ratings
  - Gray tones for text

### Responsive Design
- **Desktop** (>1024px):
  - Full-width layout
  - Spacious editing area
  - All features visible
- **Tablet** (768-1024px):
  - Adapted layout
  - Touch-friendly buttons
- **Mobile** (<768px):
  - Mobile-optimized
  - Stacked layout
  - Easy thumb navigation

### Navigation
- **Top Bar**:
  - App logo and name
  - Today button (quick access)
  - Calendar button
- **Contextual Navigation**:
  - Date arrows in daily view
  - Back navigation from calendar

---

## 💾 Data Management

### Automatic Saving
- **No Save Button**: Everything saves automatically
- **Debounced Saving**: Waits for pause in typing
- **Visual Feedback**: "Saving..." indicator

### Data Persistence
- **Local Storage**: SQLite database
- **Reliable**: Data never lost
- **Fast**: Instant loading
- **Upgradeable**: Can migrate to PostgreSQL

### Data Structure
```
Day (2024-01-15)
├── Fire Rating: 4
└── Entries
    ├── Entry 1 (9:00 AM)
    │   └── Content: Morning thoughts...
    ├── Entry 2 (2:00 PM)
    │   └── Content: Afternoon update...
    └── Entry 3 (8:00 PM)
        └── Content: Evening reflection...
```

---

## 🚀 Advanced Features

### Multiple Entries per Day
- **Why?** Record thoughts at different times
- **How?** Click "Add Another Entry"
- **Organization**: Timestamped automatically
- **Flexibility**: Different types of content per entry

### Content Types
While all entries use rich text, you can organize by:
- **Journal Entries**: Daily reflections
- **Task Lists**: To-dos and accomplishments
- **Code Snippets**: Learning notes
- **Meeting Notes**: Time-stamped records
- **Ideas**: Random thoughts throughout the day

### Links and Images
- **External Links**: Link to websites, docs, resources
- **Images**: Add screenshots, diagrams, photos
- **URLs**: Full HTTP/HTTPS support

---

## 🎯 Workflow Examples

### Morning Routine
1. Open app (automatically shows today)
2. Add first entry
3. Write morning goals and tasks
4. Set initial fire rating expectation

### Throughout the Day
1. Click "Add Another Entry"
2. Write updates, notes, accomplishments
3. Add code snippets if coding
4. Link to resources you found

### Evening Review
1. Review all entries from the day
2. Add final reflection entry
3. Update fire rating based on how day went
4. Check calendar to see weekly progress

### Weekly Review
1. Go to calendar view
2. Review which days had high fire ratings
3. Click on specific days to review
4. Identify patterns and trends

---

## 🔐 Privacy & Security

### Current Features
- **Local First**: All data stays on your machine
- **No Cloud**: No data sent to external servers
- **No Accounts**: Single-user, no login needed
- **Simple**: Just you and your notes

### Future Considerations
- User authentication for multi-user
- End-to-end encryption
- Cloud backup options
- Data export

---

## 🛠️ Customization

### What You Can Customize
- **Content**: Full control over your notes
- **Fire Ratings**: Rate days however you want
- **Organization**: Multiple entries, any structure
- **Formatting**: Rich text, code, images, links

### Future Customization Options
- Themes (light/dark mode)
- Custom color schemes
- Tag systems
- Note templates
- Shortcuts

---

## 📱 Mobile Features

### Touch Optimized
- Large tap targets
- Swipe navigation
- Mobile keyboard support
- Responsive layout

### Mobile-Specific
- Works in mobile browsers
- Can add to home screen (PWA-ready architecture)
- Touch-friendly editor
- Mobile calendar navigation

---

## 💡 Tips & Tricks

### Keyboard Shortcuts (in editor)
- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + Enter`: (Future) Save and close

### Productivity Tips
1. **Start each day with a plan**: First entry = goals
2. **End with reflection**: Last entry = what worked
3. **Use fire ratings consistently**: Track trends
4. **Add timestamps in content**: "2:30pm - Client call"
5. **Link related days**: Reference previous entries
6. **Use code blocks for quotes**: Format important text

### Organization Strategies
- **One entry per topic**: Separate work, personal, learning
- **Chronological entries**: Time-based throughout day
- **Task-based entries**: Each entry = one project
- **Stream of consciousness**: Write freely, organize later

---

## 🎓 Learning Features

### For Developers
- **Code blocks**: Save code snippets
- **Syntax highlighting**: Easy to read
- **Links**: Link to docs, Stack Overflow, GitHub
- **Daily logs**: Track what you learned

### For Writers
- **Rich formatting**: Full text styling
- **No distractions**: Clean interface
- **Timestamps**: Track writing sessions
- **Daily word count**: Track productivity

### For Students
- **Class notes**: One entry per class
- **Links to resources**: Course materials
- **Code examples**: Programming assignments
- **Study tracking**: Fire rate study days

---

## 🌟 Feature Roadmap (Ideas)

### Planned Enhancements
- [ ] Dark mode
- [ ] Search functionality
- [ ] Tags and categories
- [ ] Export to PDF/Markdown
- [ ] Statistics dashboard
- [ ] Mood tracking
- [ ] Weather integration
- [ ] Backup/restore
- [ ] Templates
- [ ] Keyboard shortcuts panel

### Advanced Features
- [ ] Multi-user support
- [ ] Collaboration
- [ ] API for integrations
- [ ] Mobile apps (native)
- [ ] Voice notes
- [ ] AI writing assistant
- [ ] Habit tracking
- [ ] Goal setting

---

## 🎉 Getting Started

Ready to explore all features?

1. **Start Simple**: Open app, write one entry
2. **Try Formatting**: Use toolbar buttons
3. **Add Fire Rating**: Rate your day
4. **Check Calendar**: See your entry indicator
5. **Add More Entries**: Record throughout day
6. **Review Weekly**: Check patterns

**Every feature is designed to be intuitive. Just explore and enjoy! 📝✨**

