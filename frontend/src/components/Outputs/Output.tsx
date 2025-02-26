// src/components/Outputs/Output.tsx
import React from 'react';
import { Box, Code, Text, Image } from '@chakra-ui/react';

interface OutputProps {
  output: {
    output_type: string;
    [key: string]: any;
  };
}

const Output: React.FC<OutputProps> = ({ output }) => {
  switch (output.output_type) {
    case 'stream':
      return (
        <Code p={2} borderRadius="md" whiteSpace="pre-wrap">
          {output.text}
        </Code>
      );

    case 'execute_result':
    case 'display_data':
      const data = output.data || {};

      // Handle text/plain
      if (data['text/plain']) {
        return (
          <Code p={2} borderRadius="md" whiteSpace="pre-wrap">
            {Array.isArray(data['text/plain'])
              ? data['text/plain'].join('')
              : data['text/plain']}
          </Code>
        );
      }

      // Handle text/html
      if (data['text/html']) {
        const html = Array.isArray(data['text/html'])
          ? data['text/html'].join('')
          : data['text/html'];
        return (
          <Box
            dangerouslySetInnerHTML={{ __html: html }}
            p={2}
            borderRadius="md"
          />
        );
      }

      // Handle image/png
      if (data['image/png']) {
        return (
          <Image
            src={`data:image/png;base64,${data['image/png']}`}
            alt="Output"
            maxWidth="100%"
          />
        );
      }

      // Handle other formats
      return (
        <Text color="gray.500">
          Unsupported output format: {Object.keys(data).join(', ')}
        </Text>
      );

    case 'error':
      return (
        <Code p={2} borderRadius="md" color="red.500" whiteSpace="pre-wrap">
          {output.ename}: {output.evalue}
          {'\n\n'}
          {Array.isArray(output.traceback)
            ? output.traceback.join('\n')
            : output.traceback}
        </Code>
      );

    default:
      return (
        <Text color="gray.500">
          Unknown output type: {output.output_type}
        </Text>
      );
  }
};

export default Output;