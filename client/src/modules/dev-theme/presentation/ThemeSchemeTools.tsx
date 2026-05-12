'use client';

import { useSyncExternalStore } from 'react';

import type { MantineColorScheme } from '@mantine/core';
import {
  Button,
  Container,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeSchemeTools() {
  const t = useTranslations('devTheme');
  const mounted = useIsClient();

  const { colorScheme, setColorScheme, toggleColorScheme } = useMantineColorScheme();
  const resolved = useComputedColorScheme('light');

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <Container className="flex flex-1 flex-col py-12" size="sm">
        <Stack gap="lg">
          <Title order={2}>{t('title')}</Title>
          <Text c="dimmed" size="sm">
            {t('hint')}
          </Text>
          {!mounted ? (
            <>
              <Skeleton height={40} radius="md" />
              <Skeleton height={20} width="70%" />
              <Skeleton height={36} width="50%" />
              <Skeleton height={36} width="40%" />
            </>
          ) : (
            <>
              <SegmentedControl
                fullWidth
                value={colorScheme}
                onChange={(v) => setColorScheme(v as MantineColorScheme)}
                data={[
                  { label: t('light'), value: 'light' },
                  { label: t('dark'), value: 'dark' },
                  { label: t('auto'), value: 'auto' },
                ]}
              />
              <Text size="sm">
                {t('resolved')}: <strong>{resolved}</strong>
              </Text>
              <Button variant="default" onClick={() => toggleColorScheme()}>
                {t('toggleShortcut')}
              </Button>
            </>
          )}
          <Button component={Link} href="/" variant="light" prefetch={false}>
            {t('home')}
          </Button>
        </Stack>
      </Container>
    </div>
  );
}
