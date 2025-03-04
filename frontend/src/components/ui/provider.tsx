'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
// import { ThemeProvider } from 'next-themes';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
      {/* <ThemeProvider attribute="class" disableTransitionOnChange>
        {props.children}
      </ThemeProvider> */}
    </ChakraProvider>
  );
}
