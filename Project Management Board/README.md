# TaskFlow - Trello-Style Project Management Board

TaskFlow is a simple, lightweight, and modern project management board built using clean HTML, CSS, and Vanilla JavaScript. It is designed to help team members collaborate on tasks across various workflow columns.

## Features

- **Dynamic Columns**: Add, inline-rename (double-click the title), and delete columns.
- **Task Cards Management**: Add, edit, and delete task cards with detailed properties:
  - Title
  - Description
  - Assigned Team Member
  - Due Date
  - Priority (High, Medium, Low)
- **Vanilla Drag and Drop**: Drag tasks between columns to update status instantly.
- **Search & Filters**:
  - Instantly search tasks by title.
  - Filter by assignee, priority, and deadline status (Safe, Near Deadline, Overdue).
  - Quick Reset filters button.
- **Deadline Status Tracker**: Highlight deadline urgency with color codes:
  - **Green (Safe)**: Deadline is far away.
  - **Yellow (Near Deadline)**: Deadline is within 2 days.
  - **Red (Overdue)**: Deadline has passed.
- **Live Activity Log**: Track all actions (create, edit, move, delete) in real-time.
- **Team Collaborator Counters**: Monitor the total number of tasks assigned to each collaborator in the sidebar.
- **Local Storage Persistence**: Save board columns, tasks, and activity logs automatically.
- **Responsive Layout**: Designed for optimal viewing on desktop, tablet, and mobile screens.

## Project Structure

```text
project/
├── index.html     # Page structure and layouts
├── style.css      # Consolidated stylesheet for all components
├── script.js      # App state, calculations, and interactions logic
└── README.md      # Setup guide and feature list
```

## How to Run

1. Clone or download this project folder.
2. Double-click `index.html` or open it in any web browser (Chrome, Firefox, Safari, Edge, etc.).
3. No installation, server setup, or build tools are required!
