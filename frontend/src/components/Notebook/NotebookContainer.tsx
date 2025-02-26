// src/components/Notebook/NotebookContainer.tsx
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, VStack, HStack, Button } from '@chakra-ui/react';
import { Toaster, toaster } from '@/components/ui/toaster';
import Column from './Column';
import { useNotebookStore } from '../../store/notebookStore';
import { api } from '../../services/api';

const NotebookContainer: React.FC = () => {
  const { notebook, setNotebook, isLoading, setIsLoading } = useNotebookStore();

  useEffect(() => {
    // For demo purposes, create a new notebook if none exists
    const initNotebook = async () => {
      try {
        setIsLoading(true);
        const response = await api.createNotebook();
        setNotebook(response);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toaster.create({
          title: 'Error creating notebook',
          type: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!notebook) {
      initNotebook();
    }
  }, []);

  const handleAddColumn = async () => {
    if (!notebook) return;

    const newColumn = {
      id: `col-${Date.now()}`,
      cells: [],
      metadata: {},
    };

    const updatedNotebook = {
      ...notebook,
      columns: [...notebook.columns, newColumn],
    };

    try {
      await api.updateNotebook(updatedNotebook);
      setNotebook(updatedNotebook);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toaster.create({
        title: 'Failed to add column',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleRunAll = async () => {
    if (!notebook) return;

    try {
      setIsLoading(true);
      await api.executeNotebook(notebook.id);
      // Fetch updated notebook with outputs
      const updatedNotebook = await api.getNotebook(notebook.id);
      setNotebook(updatedNotebook);
      toaster.create({
        title: 'Notebook executed successfully',
        type: 'success',
        duration: 3000,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toaster.create({
        title: 'Failed to execute notebook',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!notebook) {
    return <Box>No notebook found</Box>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box p={4}>
        <VStack gap={4} align="stretch">
          <HStack>
            <Button onClick={handleAddColumn}>Add Column</Button>
            <Button onClick={handleRunAll}>Run All</Button>
          </HStack>
          <HStack gap={4} alignItems="flex-start" overflowX="auto" pb={4}>
            {notebook.columns.map((column) => (
              <Column key={column.id} column={column} />
            ))}
          </HStack>
        </VStack>
      </Box>
    </DndProvider>
  );
};

export default NotebookContainer;
