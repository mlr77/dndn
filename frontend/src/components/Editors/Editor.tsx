// src/components/Editors/Editor.tsx
import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { Box } from '@chakra-ui/react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, language }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        theme: 'vs',
      });

      monacoEditorRef.current.onDidChangeModelContent(() => {
        if (monacoEditorRef.current) {
          onChange(monacoEditorRef.current.getValue());
        }
      });
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current) {
      if (monacoEditorRef.current.getValue() !== value) {
        monacoEditorRef.current.setValue(value);
      }
    }
  }, [value]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setModelLanguage(
        monacoEditorRef.current.getModel()!,
        language
      );
    }
  }, [language]);

  return <Box ref={editorRef} height="200px" width="100%" />;
};

export default Editor;
