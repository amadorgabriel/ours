'use client';

import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Box,
} from '@mantine/core';
import { IconPhone, IconTarget, IconUsers, IconLogout } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface DashboardHomeProps {
  userName?: string;
  familyName?: string;
}

export function DashboardHome({ userName, familyName }: DashboardHomeProps) {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const handleLogout = async () => {
    // TODO: Implement logout
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Container size="sm" py="md">
      <Stack gap="lg">
        {/* Greeting */}
        <Box>
          <Text size="lg" fw={600}>
            {t('greeting', { name: userName || '' })}
          </Text>
          {familyName && (
            <Text size="sm" c="dimmed">
              {familyName}
            </Text>
          )}
        </Box>

        {/* Main CTA: Call Now */}
        <Button
          size="xl"
          fullWidth
          leftSection={<IconPhone size={24} />}
          variant="gradient"
          gradient={{ from: 'green', to: 'teal' }}
          radius="md"
          styles={{
            root: {
              height: 120,
            },
          }}
        >
          <Stack gap={4} align="center">
            <Text size="lg" fw={700}>
              {t('callNow.button')}
            </Text>
            <Text size="sm" opacity={0.9}>
              {t('callNow.hint')}
            </Text>
          </Stack>
        </Button>

        {/* Weekly Summary Cards */}
        <Box>
          <Title order={2} size="h4" mb="sm">
            {t('weeklySummary')}
          </Title>
          <Group gap="sm" grow>
            <Card withBorder padding="sm" radius="md">
              <Stack gap={4} align="center">
                <IconPhone size={20} color="var(--mantine-color-green-6)" />
                <Text fw={700} size="xl">
                  8
                </Text>
                <Text size="xs" c="dimmed">
                  {t('summary.totalCalls')}
                </Text>
              </Stack>
            </Card>
            <Card withBorder padding="sm" radius="md">
              <Stack gap={4} align="center">
                <IconUsers size={20} color="var(--mantine-color-blue-6)" />
                <Text fw={700} size="xl">
                  3
                </Text>
                <Text size="xs" c="dimmed">
                  {t('summary.yourCalls')}
                </Text>
              </Stack>
            </Card>
            <Card withBorder padding="sm" radius="md">
              <Stack gap={4} align="center">
                <IconTarget size={20} color="var(--mantine-color-violet-6)" />
                <Text fw={700} size="xl">
                  75%
                </Text>
                <Text size="xs" c="dimmed">
                  {t('summary.goalProgress')}
                </Text>
              </Stack>
            </Card>
          </Group>
        </Box>

        {/* Activity Feed */}
        <Box>
          <Title order={2} size="h4" mb="sm">
            {t('activityFeed')}
          </Title>
          <Stack gap="sm">
            <Card withBorder padding="sm" radius="md">
              <Text size="sm" c="dimmed" ta="center">
                {t('placeholder')}
              </Text>
            </Card>
          </Stack>
        </Box>

        {/* Logout (temporary for testing) */}
        <Button
          variant="light"
          color="gray"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
          fullWidth
        >
          {t('logout')}
        </Button>
      </Stack>
    </Container>
  );
}