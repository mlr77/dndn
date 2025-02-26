import React from 'react';

interface Notebook {
  id: string;
  columns: Column[];
  metadata: Record<string, unknown>;
}

interface Column {
  id: string;
  cells: Cell[];
  metadata: Record<string, unknown>;
}

interface Cell {
  id: string;
  type: 'code' | 'markdown' | 'raw';
  content: string;
  outputs: Output[];
  metadata: Record<string, unknown>;
}

interface Output {
  output_type: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

interface NotebookProps {
  notebook: Notebook;
}

const Notebook: React.FC<NotebookProps> = ({ notebook }) => {
  return (
    <div>
      {notebook.columns.map((column) => (
        <div key={column.id}>
          {column.cells.map((cell) => (
            <div key={cell.id}>
              {cell.type === 'code' && <pre>{cell.content}</pre>}
              {cell.type === 'markdown' && (
                <div dangerouslySetInnerHTML={{ __html: cell.content }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Notebook;
