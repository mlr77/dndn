// src/store/notebookStore.ts
import { create } from 'zustand';

interface NotebookState {
  notebook: any | null;
  isLoading: boolean;
  setNotebook: (notebook: any | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  notebook: null,
  isLoading: false,
  setNotebook: (notebook) => set({ notebook }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
