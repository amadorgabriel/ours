'use client';

import { Box, Container, Group, Text, Avatar, ActionIcon } from '@mantine/core';
import { IconBell, IconMenu2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string;
  userPicture?: string | null;
}

export function DashboardShell({ children, userName, userPicture }: DashboardShellProps) {
  const t = useTranslations('dashboard');

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Header */}
      <Box component="header" className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <Container size="sm" px="md" py="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text fw={700} size="lg" c="blue.6">
                Ours
              </Text>
            </Group>
            <Group gap="sm">
              <ActionIcon variant="subtle" size="md" aria-label={t('notifications')}>
                <IconBell size={20} />
              </ActionIcon>
              <Avatar src={userPicture} alt={userName || 'User'} size="sm" radius="xl">
                {userName?.charAt(0) || 'U'}
              </Avatar>
              <ActionIcon variant="subtle" size="md" aria-label={t('menu')}>
                <IconMenu2 size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main content */}
      <Box component="main" className="pb-20">
        {children}
      </Box>

      {/* Bottom nav placeholder */}
      <Box
        component="nav"
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      >
        <Container size="sm" px="md" py="sm">
          <Group justify="space-around" align="center">
            <Text size="xs" c="blue.6" fw={600}>
              {t('nav.home')}
            </Text>
            <Text size="xs" c="gray.5">
              {t('nav.family')}
            </Text>
            <Text size="xs" c="gray.5">
              {t('nav.goals')}
            </Text>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}