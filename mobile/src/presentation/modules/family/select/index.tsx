import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FamilyWithRoleModel } from '@/core/domain/family';
import { useMyFamilies } from '@/core/services/usecases/family/index.hooks';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { roleLabel } from '@/presentation/modules/family/role-label';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

function FamilySelectCard({
  family,
  isSelected,
  onSelect,
}: {
  family: FamilyWithRoleModel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const initial = family.name.charAt(0).toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('familySelect.familyAccessibility', { name: family.name })}
      accessibilityState={{ selected: isSelected }}
      className={`flex-row items-center rounded-2xl border-2 p-4 ${
        isSelected ? 'border-serenity-green bg-serenity-green/10' : 'border-transparent bg-white'
      }`}
      onPress={onSelect}
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-mindful-brown/15">
        <Text className="font-sans-semibold text-lg text-mindful-brown">{initial}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-lg text-mindful-brown">{family.name}</Text>
        <View className="mt-1.5 self-start rounded-full bg-cream px-2.5 py-0.5">
          <Text className="font-sans text-xs text-mindful-brown/70">{roleLabel(family.role)}</Text>
        </View>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          isSelected ? 'border-serenity-green bg-serenity-green' : 'border-mindful-brown/30 bg-white'
        }`}
      >
        {isSelected ? <Ionicons color={colors.textLight} name="checkmark" size={14} /> : null}
      </View>
    </Pressable>
  );
}

export function FamilySelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { setFamilyId } = useFamily();
  const { data: listedFamilies, isLoading, isError, refetch } = useMyFamilies();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const families = listedFamilies ?? session?.families ?? [];

  function handleContinue() {
    if (!selectedId) {
      return;
    }

    setFamilyId(selectedId);
    router.replace(mobileRoutes.home as Href);
  }

  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-6 pt-10"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <Text className="font-sans-semibold text-2xl text-mindful-brown">{t('familySelect.title')}</Text>
        <Text className="mt-2 font-sans text-base text-mindful-brown/80">
          {t('familySelect.description')}
        </Text>

        <View className="mt-8 gap-3">
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={colors.serenityGreen60} />
              <Text className="mt-2 font-sans text-sm text-mindful-brown/70">
                {t('familySelect.loading')}
              </Text>
            </View>
          ) : null}

          {isError ? (
            <QueryErrorState
              message={t('errors.family.loadFamiliesFailed')}
              variant="inline"
              onRetry={() => {
                void refetch();
              }}
            />
          ) : null}

          {!isLoading && !isError && families.length === 0 ? (
            <EmptyState
              title={t('errors.family.noFamiliesFound')}
              variant="inline"
            />
          ) : null}

          {families.map((family) => (
            <FamilySelectCard
              key={family.id}
              family={family}
              isSelected={selectedId === family.id}
              onSelect={() => setSelectedId(family.id)}
            />
          ))}
        </View>
      </ScrollView>

      {!isLoading && !isError && families.length > 0 ? (
        <View
          className="border-t border-mindful-brown/10 bg-cream px-6 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('familySelect.continueAccessibility')}
            accessibilityState={{ disabled: !selectedId }}
            className={`items-center rounded-xl py-4 ${
              selectedId ? 'bg-serenity-green' : 'bg-mindful-brown/15'
            }`}
            disabled={!selectedId}
            onPress={handleContinue}
          >
            <Text
              className={`font-sans-semibold ${
                selectedId ? 'text-light' : 'text-mindful-brown/40'
              }`}
            >
              {t('common.continue')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
