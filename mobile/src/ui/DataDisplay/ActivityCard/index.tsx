import { Text, View, Image } from 'react-native';

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
    case 'Contribution':
      return 'Contribuição';
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

function SeenByAvatars({ seenBy }: { seenBy: ActivityFeedItem['seenBy'] }) {
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
        {seenBy.length === 1 ? 'Visto' : `Visto por ${seenBy.length}`}
      </Text>
    </View>
  );
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
      {item.type === 'Contribution' && item.contributionAmount != null ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
          {item.goalTitle
            ? `R$ ${item.contributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${item.goalTitle}`
            : `R$ ${item.contributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </Text>
      ) : null}
      {item.type === 'Visit' && item.startAt ? (
        <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
          {item.allDay
            ? `Dia inteiro — ${new Date(item.startAt).toLocaleDateString('pt-BR')}`
            : `${new Date(item.startAt).toLocaleString('pt-BR')}${item.endAt ? ` até ${new Date(item.endAt).toLocaleString('pt-BR')}` : ''}`}
        </Text>
      ) : null}
      {item.type === 'Visit' && item.photoUrl ? (
        <Image
          accessibilityLabel="Foto da visita"
          className="mt-3 h-40 w-full rounded-xl"
          resizeMode="cover"
          source={{ uri: item.photoUrl }}
        />
      ) : null}
      <SeenByAvatars seenBy={item.seenBy} />
    </View>
  );
}
