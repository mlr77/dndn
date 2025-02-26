// src/services/api.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const api = {
  async getNotebook(notebookId: string) {
    const response = await axios.get(`${BASE_URL}/notebooks/${notebookId}`);
    return response.data;
  },

  async createNotebook() {
    const response = await axios.post(`${BASE_URL}/notebooks`);
    return response.data;
  },

  async updateNotebook(notebook: any) {
    const response = await axios.put(
      `${BASE_URL}/notebooks/${notebook.id}`,
      notebook
    );
    return response.data;
  },

  async executeCell(cellId: string) {
    const response = await axios.post(`${BASE_URL}/cells/${cellId}/execute`);
    return response.data;
  },

  async executeColumn(columnId: string) {
    const response = await axios.post(
      `${BASE_URL}/columns/${columnId}/execute`
    );
    return response.data;
  },

  async executeNotebook(notebookId: string) {
    const response = await axios.post(
      `${BASE_URL}/notebooks/${notebookId}/execute`
    );
    return response.data;
  },

  async uploadNotebook(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
