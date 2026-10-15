import { useState } from 'react';
import { Text, View, Image, Pressable } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useOptionalAssistido } from '@/presentation/providers/assistido';
import { radius } from '@/presentation/styles/tokens';
import { PersonAvatar } from '@/ui/DataDisplay/PersonAvatar';

type ActivityCardProps = {
  item: ActivityFeedItem;
  onPress?: (item: ActivityFeedItem) => void;
  onPhotoPress?: (uri: string) => void;
  editable?: boolean;
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

function viewerPhoto(viewer: { picture?: string; userPicture?: string }): string | undefined {
  return viewer.picture || viewer.userPicture;
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
          className="-ml-1 h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white bg-mindful-brown/15"
        >
          {viewerPhoto(viewer) ? (
            <Image
              accessibilityLabel={t('activityCard.seenByPhoto', { name: viewer.userName })}
              source={{ uri: viewerPhoto(viewer) }}
              style={{ width: 24, height: 24 }}
            />
          ) : (
            <Text className="font-sans-semibold text-[10px] text-mindful-brown">
              {viewer.userName.charAt(0).toUpperCase()}
            </Text>
          )}
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

export function ActivityCard({ item, onPress, onPhotoPress, editable = false }: ActivityCardProps) {
  const { t } = useTranslation();
  const assistido = useOptionalAssistido();
  const typeLabel = useActivityTypeLabel(item.type);
  const relativeTime = useRelativeTime(item.createdAt);
  const parent = item.parentId
    ? assistido?.parents.find((candidate) => candidate.id === item.parentId)
    : undefined;
  const assistidoName = item.parentName ?? parent?.name;
  const [pressed, setPressed] = useState(false);

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

  const content = (
    <>
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-sm text-serenity-green">{typeLabel}</Text>
        <Text className="font-sans text-xs text-mindful-brown/60">{relativeTime}</Text>
      </View>
      {assistidoName ? (
        <View className="mt-3 flex-row items-center">
          <PersonAvatar name={assistidoName} photoUri={parent?.photoData} />
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-sans text-xs text-mindful-brown/60">{t('common.assistido')}</Text>
            <Text className="font-sans-semibold text-base text-mindful-brown" numberOfLines={1}>
              {assistidoName}
            </Text>
            <Text className="font-sans text-sm text-mindful-brown/70" numberOfLines={1}>
              {item.userName}
            </Text>
          </View>
        </View>
      ) : (
        <Text className="mt-3 font-sans-semibold text-mindful-brown">{item.userName}</Text>
      )}
      {item.notes ? (
        <Text className="mt-3 font-sans text-sm text-mindful-brown/80">{item.notes}</Text>
      ) : null}
      {contributionText ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{contributionText}</Text>
      ) : null}
      {visitText ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{visitText}</Text>
      ) : null}
      {item.type === 'Visit' && item.photoUrl ? (
        onPhotoPress ? (
          <Pressable
            accessibilityLabel={t('activityCard.visitPhotoPreviewAccessibility')}
            accessibilityRole="button"
            className="mt-3 overflow-hidden rounded-xl"
            onPress={() => onPhotoPress(item.photoUrl!)}
          >
            <Image
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              className="h-40 w-full"
              resizeMode="cover"
              source={{ uri: item.photoUrl }}
            />
          </Pressable>
        ) : (
          <Image
            accessibilityLabel={t('activityCard.visitPhotoAccessibility')}
            className="mt-3 h-40 w-full rounded-xl"
            resizeMode="cover"
            source={{ uri: item.photoUrl }}
          />
        )
      ) : null}
      <SeenByAvatars seenBy={item.seenBy} />
      {editable ? (
        <Text className="mt-2 font-sans text-xs text-serenity-green">{t('activityCard.editableHint')}</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <View style={{ marginBottom: 12, borderRadius: radius.lg, transform: [{ scale: pressed ? 0.985 : 1 }] }}>
        <View className="bg-white/80" style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('activityCard.openAccessibility', { type: typeLabel })}
            android_ripple={{ color: 'rgba(90, 104, 56, 0.16)', foreground: true }}
            onPress={() => onPress(item)}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
          >
            <View className="p-4">{content}</View>
          </Pressable>
        </View>
      </View>
    );
  }

  return <View className="mb-3 rounded-2xl bg-white/80 p-4">{content}</View>;
}
