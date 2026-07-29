'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { Link } from '@/i18n/navigation';
import { routes } from '@/i18n/routes';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Modal } from '@/ui/Feedback/Modal';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

type DayDetailModalProps = {
  opened: boolean;
  dateLabel: string;
  items: ActivityFeedItem[];
  onClose: () => void;
};

function formatActivityDate(isoDate: string): string {
  return format(new Date(isoDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function activityTypeLabel(
  type: ActivityFeedItem['type'],
  t: ReturnType<typeof useTranslations<'calendar'>>
) {
  const key = `activityTypes.${type}` as const;
  return t(key);
}

function ActivityListItem({
  item,
  t,
}: {
  item: ActivityFeedItem;
  t: ReturnType<typeof useTranslations<'calendar'>>;
}) {
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

export function DayDetailModal({ opened, dateLabel, items, onClose }: DayDetailModalProps) {
  const t = useTranslations('calendar');

  return (
    <Modal opened={opened} onClose={onClose} title={dateLabel} size="md">
      <Stack gap="md" align="stretch">
        <Text size="sm" c="dimmed">
          {items.length === 1
            ? t('dayDetail.countOne')
            : t('dayDetail.countMany', { count: items.length })}
        </Text>

        {items.length === 0 ? (
          <Stack gap="md" align="stretch">
            <Text size="sm" c="dimmed">
              {t('dayDetail.empty')}
            </Text>
            <Button component={Link} href={routes.feed} variant="light" onClick={onClose}>
              {t('dayDetail.registerCallLink')}
            </Button>
          </Stack>
        ) : (
          <Stack gap="sm" align="stretch">
            {items.map((item) => (
              <ActivityListItem key={item.id} item={item} t={t} />
            ))}
            <Button component={Link} href={routes.feed} variant="subtle" onClick={onClose}>
              {t('dayDetail.registerCallLink')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
