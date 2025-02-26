import { Container } from '@chakra-ui/react';
import styles from './page.module.css';
import { Box, Skeleton, ClientOnly } from '@chakra-ui/react';
import { ColorModeToggle } from '../components/ui/color-mode-toggle';

export default function Home() {
  return (
    <Container className={styles.container}>
      <Box
        pos="absolute"
        top="4"
        right="4"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
    </Container>
  );
}
