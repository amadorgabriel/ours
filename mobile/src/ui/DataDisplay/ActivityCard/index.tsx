import { Text, View } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';

type ActivityCardProps = {
  item: ActivityFeedItem;
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h atrás`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getActivityLabel(type: ActivityFeedItem['type']): string {
  switch (type) {
    case 'Call':
      return 'Ligação';
    case 'Visit':
      return 'Visita';
    case 'Medical':
      return 'Consulta';
    case 'Task':
      return 'Tarefa';
    case 'Medication':
      return 'Medicação';
    default:
      return 'Atividade';
  }
}

export function ActivityCard({ item }: ActivityCardProps) {
  return (
    <View className="mb-3 rounded-2xl bg-white/80 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-mindful-brown">{getActivityLabel(item.type)}</Text>
        <Text className="font-sans text-xs text-mindful-brown/60">
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
      <Text className="mt-2 font-sans text-sm text-mindful-brown">{item.userName}</Text>
      {item.parentName ? (
        <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
          Assistido: {item.parentName}
        </Text>
      ) : null}
      {item.notes ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{item.notes}</Text>
      ) : null}
    </View>
  );
}
