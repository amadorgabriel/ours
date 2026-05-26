'use client';

import { Box, Container, Stack } from '@mantine/core';

interface AuthLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Layout centralizado para telas de autenticação.
 * Segue especificações do design system:
 * - Full viewport height
 * - Max-width: 480px (sm)
 * - Padding: 16px
 * - Background: gray-50
 */
export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      className="min-h-screen bg-gray-50"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container
        size="sm"
        px="md"
        py="xl"
        className="flex flex-1 flex-col justify-center"
      >
        <Stack gap="xl" align="stretch">
          {children}
        </Stack>
      </Container>

      {footer && (
        <Box component="footer" py="md" className="text-center">
          <Container size="sm">{footer}</Container>
        </Box>
      )}
    </Box>
  );
}
