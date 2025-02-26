# app/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uuid
import os
import json
from .jupyter import JupyterClient
from .redis_client import RedisClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access environment variables
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

app = FastAPI(title="Notebook Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
jupyter_client = JupyterClient()
redis_client = RedisClient()

# Models
class Cell(BaseModel):
    id: str
    type: str  # 'code', 'markdown', 'raw'
    content: str
    outputs: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}

class Column(BaseModel):
    id: str
    cells: List[Cell] = []
    metadata: Dict[str, Any] = {}

class Notebook(BaseModel):
    id: Optional[str] = None
    columns: List[Column] = []
    metadata: Dict[str, Any] = {}

class ExecuteRequest(BaseModel):
    code: str

class CellExecuteRequest(BaseModel):
    cell_id: str

# Routes
@app.get("/notebooks/{notebook_id}")
async def get_notebook(notebook_id: str):
    """Get a notebook by ID"""
    notebook_data = await redis_client.get_notebook(notebook_id)
    if not notebook_data:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook_data

@app.post("/notebooks")
async def create_notebook():
    """Create a new notebook"""
    notebook_id = str(uuid.uuid4())
    notebook = Notebook(id=notebook_id)

    # Add an initial empty column
    column_id = str(uuid.uuid4())
    notebook.columns.append(Column(id=column_id))

    await redis_client.save_notebook(notebook_id, notebook.dict())
    return notebook

@app.put("/notebooks/{notebook_id}")
async def update_notebook(notebook_id: str, notebook: Notebook):
    """Update a notebook's structure"""
    # Ensure the ID in the path matches the notebook
    if notebook.id and notebook.id != notebook_id:
        raise HTTPException(status_code=400, detail="Notebook ID mismatch")

    notebook.id = notebook_id
    await redis_client.save_notebook(notebook_id, notebook.dict())
    return notebook

@app.post("/cells/{cell_id}/execute")
async def execute_cell(cell_id: str, background_tasks: BackgroundTasks):
    """Execute a single cell"""
    # Find the cell in Redis
    notebooks = await redis_client.get_all_notebooks()
    target_notebook = None
    target_column = None
    target_cell = None

    for notebook_id, notebook_data in notebooks.items():
        for column in notebook_data.get("columns", []):
            for cell in column.get("cells", []):
                if cell.get("id") == cell_id:
                    target_notebook = notebook_data
                    target_cell = cell
                    target_column = column
                    break
            if target_cell:
                break
        if target_cell:
            break

    if not target_cell:
        raise HTTPException(status_code=404, detail="Cell not found")

    # Execute the code
    result = await jupyter_client.execute_code(target_cell["content"])

    # Update cell outputs
    target_cell["outputs"] = result

    # Save the updated notebook
    await redis_client.save_notebook(target_notebook["id"], target_notebook)

    return {"outputs": result}

@app.post("/columns/{column_id}/execute")
async def execute_column(column_id: str):
    """Execute all cells in a column"""
    # Find the column in Redis
    notebooks = await redis_client.get_all_notebooks()
    target_notebook = None
    target_column = None

    for notebook_id, notebook_data in notebooks.items():
        for column in notebook_data.get("columns", []):
            if column.get("id") == column_id:
                target_notebook = notebook_data
                target_column = column
                break
        if target_column:
            break

    if not target_column:
        raise HTTPException(status_code=404, detail="Column not found")

    # Execute each cell sequentially
    for cell in target_column.get("cells", []):
        if cell.get("type") == "code":
            result = await jupyter_client.execute_code(cell.get("content", ""))
            cell["outputs"] = result

    # Save the updated notebook
    await redis_client.save_notebook(target_notebook["id"], target_notebook)

    return {"status": "Column execution completed"}

@app.post("/notebooks/{notebook_id}/execute")
async def execute_notebook(notebook_id: str):
    """Execute all cells in a notebook"""
    notebook_data = await redis_client.get_notebook(notebook_id)
    if not notebook_data:
        raise HTTPException(status_code=404, detail="Notebook not found")

    # Execute each cell in each column sequentially
    for column in notebook_data.get("columns", []):
        for cell in column.get("cells", []):
            if cell.get("type") == "code":
                result = await jupyter_client.execute_code(cell.get("content", ""))
                cell["outputs"] = result

    # Save the updated notebook
    await redis_client.save_notebook(notebook_id, notebook_data)

    return {"status": "Notebook execution completed"}

@app.post("/upload")
async def upload_notebook(file: bytes):
    """Upload and parse .ipynb or Python file"""
    # Implementation depends on file format detection
    # For now, assume it's a .ipynb file
    try:
        notebook_data = json.loads(file)
        # Convert from .ipynb format to our format
        new_notebook = Notebook(id=str(uuid.uuid4()))

        # Create a single column
        column = Column(id=str(uuid.uuid4()))

        # Add cells from the .ipynb
        for cell in notebook_data.get("cells", []):
            cell_type = cell.get("cell_type", "code")
            content = "".join(cell.get("source", []))
            outputs = cell.get("outputs", [])

            new_cell = Cell(
                id=str(uuid.uuid4()),
                type=cell_type,
                content=content,
                outputs=outputs
            )
            column.cells.append(new_cell)

        new_notebook.columns.append(column)

        # Save to Redis
        await redis_client.save_notebook(new_notebook.id, new_notebook.dict())

        return new_notebook
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse notebook: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)