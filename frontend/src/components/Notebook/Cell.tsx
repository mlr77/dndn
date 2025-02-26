// src/components/Notebook/Cell.tsx
import React, { useState } from 'react';
import { Box, HStack, Button, Badge } from '@chakra-ui/react';
import { useDrag, useDrop } from 'react-dnd';
import Editor from '../Editors/Editor';
import Output from '../Outputs/Output';
import { useNotebookStore } from '../../store/notebookStore';
import { api } from '../../services/api';

interface CellProps {
  cell: {
    id: string;
    type: string;
    content: string;
    outputs: any[];
    metadata: Record<string, any>;
  };
  columnId: string;
}

const Cell: React.FC<CellProps> = ({ cell, columnId }) => {
  const { notebook, setNotebook } = useNotebookStore();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleContentChange = (newContent: string) => {
    if (!notebook) return;

    const updatedColumns = notebook.columns.map((column) => {
      if (column.id !== columnId) return column;

      const updatedCells = column.cells.map((c) =>
        c.id === cell.id ? { ...c, content: newContent } : c
      );

      return { ...column, cells: updatedCells };
    });

    const updatedNotebook = {
      ...notebook,
      columns: updatedColumns,
    };

    // We don't save on every keystroke, just update local state
    setNotebook(updatedNotebook);
  };

  const handleSaveCell = async () => {
    if (!notebook) return;

    try {
      await api.updateNotebook(notebook);
    } catch (error) {
      console.error('Failed to save cell', error);
    }
  };

  const handleRunCell = async () => {
    try {
      setIsExecuting(true);
      await api.executeCell(cell.id);

      // Fetch updated notebook with outputs
      if (notebook) {
        const updatedNotebook = await api.getNotebook(notebook.id);
        setNotebook(updatedNotebook);
      }
    } catch (error) {
      console.error('Failed to execute cell', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Drag and drop handlers would go here

  return (
    <Box borderWidth="1px" borderRadius="md" p={2} bg="white">
      <HStack mb={2} gap={2}>
        <Badge>{cell.type}</Badge>
        <Button size="xs" onClick={handleRunCell} loading={isExecuting}>
          Run
        </Button>
        <Button size="xs" onClick={handleSaveCell}>
          Save
        </Button>
      </HStack>

      <Editor
        value={cell.content}
        onChange={handleContentChange}
        language={cell.type === 'code' ? 'python' : 'markdown'}
      />

      {cell.outputs.length > 0 && (
        <Box mt={2} p={2} borderTopWidth="1px">
          {cell.outputs.map((output, index) => (
            <Output key={index} output={output} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Cell;
