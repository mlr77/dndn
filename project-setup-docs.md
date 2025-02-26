# Development Documentation for Interactive Notebook Application

## Project Structure

```
notebook-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Notebook/     # Notebook-related components
│   │   │   ├── Cell/         # Cell components (Code, Markdown, etc.)
│   │   │   ├── Editors/      # Editor components (Monaco, CodeMirror)
│   │   │   └── Outputs/      # Output renderers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   │   ├── jupyter.ts    # Jupyter communication
│   │   │   └── collaboration.ts # Yjs/collaboration
│   │   ├── store/            # Zustand store
│   │   └── types/            # TypeScript type definitions
│   └── public/
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core business logic
│   │   ├── jupyter/          # Jupyter integration
│   │   └── redis/            # Redis caching
│   └── tests/
├── docker/                   # Docker configurations
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── jupyter.Dockerfile
└── docs/                     # Documentation
```

## Development Workflow

### Setup Environment

```bash
# Install frontend dependencies
cd frontend
npm install

# Setup Python environment for backend
cd ../backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Run Development Servers

```bash
# Terminal 1: Run frontend
cd frontend
npm start

# Terminal 2: Run backend
cd backend
uvicorn app.main:app --reload

# Terminal 3: Run Jupyter server
cd backend
jupyter lab --NotebookApp.token='' --NotebookApp.allow_origin='*'
```

## Key Components

### Cell Rendering

Each cell consists of:
- Editor component (Monaco/CodeMirror)
- Output area
- Cell toolbar for actions
- Drag handle for reordering

### Collaboration

Collaboration is handled via:
- Yjs document for shared editing
- WebSocket connection for real-time updates
- Redis for persistence

### Notebook Model

The notebook structure is:
```typescript
interface Notebook {
  id: string;
  columns: Column[];
  metadata: Record<string, any>;
}

interface Column {
  id: string;
  cells: Cell[];
  metadata: Record<string, any>;
}

interface Cell {
  id: string;
  type: 'code' | 'markdown' | 'raw';
  content: string;
  outputs: Output[];
  metadata: Record<string, any>;
}

interface Output {
  output_type: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
}
```

## Testing Strategy

1. **Unit Tests** - Test individual components
2. **Integration Tests** - Test interaction between components
3. **Output Rendering Tests** - Ensure all output types render correctly
4. **Collaboration Tests** - Test concurrent editing

## Common Issues and Solutions

### Monaco Performance

When dealing with multiple Monaco instances:
- Use virtualization with react-window or react-virtualized
- Implement editor pooling to reuse instances
- Consider switching to CodeMirror for lighter weight

### Widget Rendering

For Jupyter widgets:
1. Install required packages:
   ```
   npm install @jupyter-widgets/base @jupyter-widgets/controls
   ```
2. Set up communication channel with kernel
3. Register widget renderers with mimetype handlers

### Collaboration Conflicts

When conflicts occur in collaborative editing:
1. Yjs should handle most concurrent editing cases automatically
2. For structural changes (adding/removing cells), implement custom merge resolution
3. Use optimistic updates with rollback capabilities
