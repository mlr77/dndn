// src/components/Notebook/Column.tsx
import React from 'react';
import { Box, VStack, Button, Heading } from '@chakra-ui/react';
import { useDrag, useDrop } from 'react-dnd';
import Cell from './Cell';
import { useNotebookStore } from '../../store/notebookStore';
import { api } from '../../services/api';

interface ColumnProps {
  column: {
    id: string;
    cells: any[];
    metadata: Record<string, any>;
  };
}

const Column: React.FC<ColumnProps> = ({ column }) => {
  const { notebook, setNotebook } = useNotebookStore();

  const handleAddCell = async () => {
    if (!notebook) return;

    const newCell = {
      id: `cell-${Date.now()}`,
      type: 'code',
      content: '',
      outputs: [],
      metadata: {},
    };

    const updatedColumn = {
      ...column,
      cells: [...column.cells, newCell],
    };

    const updatedColumns = notebook.columns.map((c) =>
      c.id === column.id ? updatedColumn : c
    );

    const updatedNotebook = {
      ...notebook,
      columns: updatedColumns,
    };

    try {
      await api.updateNotebook(updatedNotebook);
      setNotebook(updatedNotebook);
    } catch (error) {
      console.error('Failed to add cell', error);
    }
  };

  const handleRunColumn = async () => {
    try {
      await api.executeColumn(column.id);
      // Fetch updated notebook with outputs
      if (notebook) {
        const updatedNotebook = await api.getNotebook(notebook.id);
        setNotebook(updatedNotebook);
      }
    } catch (error) {
      console.error('Failed to execute column', error);
    }
  };

  // Drag and drop handlers would go here

  return (
    <Box
      width="350px"
      minHeight="300px"
      bg="gray.50"
      p={3}
      borderRadius="md"
      shadow="md"
      flex="0 0 auto"
    >
      <VStack gap={3} align="stretch">
        <Heading size="sm">
          {column.metadata.title || `Column ${column.id}`}
        </Heading>
        <Button size="sm" onClick={handleRunColumn}>
          Run Column
        </Button>

        {column.cells.map((cell) => (
          <Cell key={cell.id} cell={cell} columnId={column.id} />
        ))}

        <Button size="sm" onClick={handleAddCell}>
          Add Cell
        </Button>
      </VStack>
    </Box>
  );
};

export default Column;
