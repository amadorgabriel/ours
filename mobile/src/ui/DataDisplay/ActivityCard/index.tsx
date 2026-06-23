import { Text, View, Image } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useTranslation } from '@/presentation/hooks/use-translation';

type ActivityCardProps = {
  item: ActivityFeedItem;
};

function useRelativeTime(isoDate: string): string {
  const { t } = useTranslation();
  const date = new Date(isoDate);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return t('activityCard.time.now');
  if (diffMinutes < 60) return t('activityCard.time.minutesAgo', { count: diffMinutes });

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return t('activityCard.time.hoursAgo', { count: diffHours });

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return t('activityCard.time.yesterday');
  if (diffDays < 7) return t('activityCard.time.daysAgo', { count: diffDays });

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function useActivityTypeLabel(type: ActivityFeedItem['type']): string {
  const { t } = useTranslation();

  switch (type) {
    case 'Call':
      return t('activityCard.types.call');
    case 'Visit':
      return t('activityCard.types.visit');
    case 'Contribution':
      return t('activityCard.types.contribution');
    case 'Medical':
      return t('activityCard.types.medical');
    case 'Task':
      return t('activityCard.types.task');
    case 'Medication':
      return t('activityCard.types.medication');
    default:
      return t('activityCard.types.default');
  }
}

function SeenByAvatars({ seenBy }: { seenBy: ActivityFeedItem['seenBy'] }) {
  const { t } = useTranslation();

  if (!seenBy?.length) {
    return null;
  }

  return (
    <View className="mt-3 flex-row items-center">
      {seenBy.slice(0, 4).map((viewer) => (
        <View
          key={viewer.userId}
          className="-ml-1 h-6 w-6 items-center justify-center rounded-full border border-white bg-mindful-brown/15"
        >
          <Text className="font-sans-semibold text-[10px] text-mindful-brown">
            {viewer.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      ))}
      <Text className="ml-2 font-sans text-xs text-mindful-brown/60">
        {seenBy.length === 1
          ? t('activityCard.seen')
          : t('activityCard.seenBy', { count: seenBy.length })}
      </Text>
    </View>
  );
}

export function ActivityCard({ item }: ActivityCardProps) {
  const { t } = useTranslation();
  const typeLabel = useActivityTypeLabel(item.type);
  const relativeTime = useRelativeTime(item.createdAt);

  const contributionText =
    item.type === 'Contribution' && item.contributionAmount != null
      ? item.goalTitle
        ? t('activityCard.contributionInGoal', {
            amount: item.contributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            goal: item.goalTitle,
          })
        : t('activityCard.contributionAmount', {
            amount: item.contributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          })
      : null;

  const visitText =
    item.type === 'Visit' && item.startAt
      ? item.allDay
        ? t('activityCard.visitAllDay', {
            date: new Date(item.startAt).toLocaleDateString('pt-BR'),
          })
        : t('activityCard.visitRange', {
            start: new Date(item.startAt).toLocaleString('pt-BR'),
            end: item.endAt
              ? t('activityCard.visitEnd', {
                  date: new Date(item.endAt).toLocaleString('pt-BR'),
                })
              : '',
          })
      : null;

  return (
    <View className="mb-3 rounded-2xl bg-white/80 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-mindful-brown">{typeLabel}</Text>
        <Text className="font-sans text-xs text-mindful-brown/60">{relativeTime}</Text>
      </View>
      <Text className="mt-2 font-sans text-sm text-mindful-brown">{item.userName}</Text>
      {item.parentName ? (
        <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
          {t('activityCard.assistido', { name: item.parentName })}
        </Text>
      ) : null}
      {item.notes ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{item.notes}</Text>
      ) : null}
      {contributionText ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{contributionText}</Text>
      ) : null}
      {visitText ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{visitText}</Text>
      ) : null}
      {item.type === 'Visit' && item.photoUrl ? (
        <Image
          accessibilityLabel={t('activityCard.visitPhotoAccessibility')}
          className="mt-3 h-40 w-full rounded-xl"
          resizeMode="cover"
          source={{ uri: item.photoUrl }}
        />
      ) : null}
      <SeenByAvatars seenBy={item.seenBy} />
    </View>
  );
}
