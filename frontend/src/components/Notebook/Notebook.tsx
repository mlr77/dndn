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
