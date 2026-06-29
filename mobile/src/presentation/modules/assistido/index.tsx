import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { requestCreateParentSheet } from '@/core/infra/navigation/create-parent-intent';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAuth } from '@/presentation/providers/auth';
import { useAssistido } from '@/presentation/providers/assistido';
import { useFamily } from '@/presentation/providers/family';
import { relationshipLabel } from '@/presentation/modules/family/relationship-label';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

type AssistidoSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function ParentListItem({
  parent,
  isSelected,
  onSelect,
}: {
  parent: { id: string; name: string; relationship: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('assistido.selectAccessibility', { name: parent.name })}
      accessibilityState={{ selected: isSelected }}
      className={`mb-2 flex-row items-center rounded-xl px-4 py-3 ${
        isSelected ? 'bg-serenity-green/15' : 'bg-white'
      }`}
      onPress={onSelect}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
        <Text className="font-sans-semibold text-mindful-brown">
          {parent.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-mindful-brown">{parent.name}</Text>
        <Text className="font-sans text-sm text-mindful-brown/70">
          {relationshipLabel(parent.relationship)}
        </Text>
      </View>
    </Pressable>
  );
}

export function AssistidoSheet({ visible, onClose }: AssistidoSheetProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const { parents, parentId, isLoading, isError, refetch, setParentId } = useAssistido();

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const isAdmin = activeFamily?.role === 'Admin';

  function handleSelect(id: string) {
    setParentId(id);
    onClose();
  }

  function handleAdminCreate() {
    onClose();
    router.push('/(app)/(tabs)/profile' as Href);
    requestCreateParentSheet();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel={t('assistido.sheetAccessibility')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('assistido.title')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{t('assistido.description')}</Text>

      {!isLoading && !isError && parents.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('assistido.allAccessibility')}
          accessibilityState={{ selected: parentId === null }}
          className={`mt-4 flex-row items-center rounded-xl px-4 py-3 ${
            parentId === null ? 'bg-serenity-green/15' : 'bg-white'
          }`}
          onPress={() => {
            setParentId(null);
            onClose();
          }}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
            <Text className="font-sans-semibold text-mindful-brown">∞</Text>
          </View>
          <View className="flex-1">
            <Text className="font-sans-semibold text-mindful-brown">{t('assistido.all')}</Text>
            <Text className="font-sans text-sm text-mindful-brown/70">{t('assistido.allDescription')}</Text>
          </View>
        </Pressable>
      ) : null}

      {isLoading && (
        <View className="mt-6 items-center py-4">
          <ActivityIndicator color={colors.serenityGreen60} />
          <Text className="mt-2 font-sans text-sm text-mindful-brown/70">{t('common.loading')}</Text>
        </View>
      )}

      {isError && !isLoading ? (
        <View className="mt-6">
          <QueryErrorState
            message={t('errors.parents.loadListFailed')}
            variant="inline"
            onRetry={refetch}
          />
        </View>
      ) : null}

      {!isLoading && !isError && parents.length === 0 ? (
        <View className="mt-6">
          <EmptyState
            title={t('assistido.emptyTitle')}
            description={
              isAdmin ? t('assistido.emptyAdminDescription') : t('assistido.emptyMemberDescription')
            }
            actionLabel={isAdmin ? t('assistido.registerAssistido') : undefined}
            onAction={isAdmin ? handleAdminCreate : undefined}
            variant="inline"
          />
        </View>
      ) : null}

      {!isLoading &&
        !isError &&
        parents.length > 0 ? (
          <View className="mt-2">
            {parents.map((parent) => (
              <ParentListItem
                key={parent.id}
                parent={parent}
                isSelected={parent.id === parentId}
                onSelect={() => handleSelect(parent.id)}
              />
            ))}
          </View>
        ) : null}
    </BottomSheet>
  );
}
