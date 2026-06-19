'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useActivityFeed } from '@/core/services/usecases/activity/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { RegisterCallModal } from './register-call-modal';

function formatActivityDate(isoDate: string): string {
  return format(new Date(isoDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function activityTypeLabel(type: ActivityFeedItem['type'], t: ReturnType<typeof useTranslations<'feed'>>) {
  const key = `activityTypes.${type}` as const;
  return t(key);
}

function ActivityListItem({ item, t }: { item: ActivityFeedItem; t: ReturnType<typeof useTranslations<'feed'>> }) {
  return (
    <SurfaceCard>
      <Stack gap={4} align="stretch">
        <Stack gap={0} align="stretch" className="sm:flex-row sm:items-center sm:justify-between">
          <Text fw={600}>{activityTypeLabel(item.type, t)}</Text>
          <Text size="xs" c="dimmed">
            {formatActivityDate(item.createdAt)}
          </Text>
        </Stack>
        <Text size="sm">{item.userName}</Text>
        {item.parentName && (
          <Text size="sm" c="dimmed">
            {item.parentName}
          </Text>
        )}
        {item.notes && (
          <Text size="sm" c="dimmed">
            {item.notes}
          </Text>
        )}
      </Stack>
    </SurfaceCard>
  );
}

export function FeedPage() {
  const t = useTranslations('feed');
  const { data, isLoading, isError, refetch } = useActivityFeed();
  const [registerOpen, setRegisterOpen] = useState(false);
  const items = data?.items ?? [];

  return (
    <>
      <Page
        header={
          <Stack gap="xs" align="stretch" className="sm:flex-row sm:items-center sm:justify-between">
            <Stack gap="xs" align="stretch">
              <Title order={2}>{t('title')}</Title>
              <Text c="dimmed">{t('subtitle')}</Text>
            </Stack>
            <Button onClick={() => setRegisterOpen(true)} className="w-full sm:w-auto">
              {t('registerCallCta')}
            </Button>
          </Stack>
        }
      >
        {isLoading ? (
          <Text c="dimmed">{t('loading')}</Text>
        ) : isError ? (
          <Stack gap="md" align="stretch">
            <Alert color="red" variant="light">
              {t('loadError')}
            </Alert>
            <Button variant="light" onClick={() => void refetch()}>
              {t('retry')}
            </Button>
          </Stack>
        ) : items.length === 0 ? (
          <SurfaceCard>
            <Stack gap="md" align="stretch">
              <Text fw={600}>{t('emptyTitle')}</Text>
              <Text size="sm" c="dimmed">
                {t('emptyDescription')}
              </Text>
              <Button onClick={() => setRegisterOpen(true)} className="w-full sm:w-auto">
                {t('registerCallCta')}
              </Button>
            </Stack>
          </SurfaceCard>
        ) : (
          <Stack gap="md" align="stretch">
            {items.map((item) => (
              <ActivityListItem key={item.id} item={item} t={t} />
            ))}
          </Stack>
        )}
      </Page>

      <RegisterCallModal opened={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
}
