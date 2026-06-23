import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useMyFamilies } from '@/core/services/usecases/family/index.hooks';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { roleLabel } from '@/presentation/modules/family/role-label';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';

export function FamilySelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();
  const { setFamilyId } = useFamily();
  const { data: listedFamilies, isLoading, isError } = useMyFamilies();

  const families = listedFamilies ?? session?.families ?? [];

  function handleSelect(familyId: string) {
    setFamilyId(familyId);
    router.replace(mobileRoutes.home as Href);
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerClassName="grow px-6 py-10">
      <Text className="font-sans-semibold text-2xl text-mindful-brown">{t('familySelect.title')}</Text>
      <Text className="mt-2 font-sans text-base text-mindful-brown/80">
        {t('familySelect.description')}
      </Text>

      <View className="mt-8 gap-4">
        {isLoading && (
          <View className="items-center py-8">
            <ActivityIndicator color={colors.serenityGreen60} />
            <Text className="mt-2 font-sans text-sm text-mindful-brown/70">{t('familySelect.loading')}</Text>
          </View>
        )}

        {isError && (
          <Text className="font-sans text-sm text-red-600">
            {t('errors.family.loadFamiliesFailed')}
          </Text>
        )}

        {!isLoading && !isError && families.length === 0 && (
          <Text className="font-sans text-sm text-mindful-brown/70">
            {t('errors.family.noFamiliesFound')}
          </Text>
        )}

        {families.map((family) => (
          <Pressable
            key={family.id}
            accessibilityRole="button"
            className="rounded-2xl bg-white p-5"
            onPress={() => handleSelect(family.id)}
          >
            <Text className="font-sans-semibold text-lg text-mindful-brown">{family.name}</Text>
            <Text className="mt-1 font-sans text-sm text-mindful-brown/70">{roleLabel(family.role)}</Text>
            <Text className="mt-3 font-sans-semibold text-sm text-trust-blue">{t('familySelect.select')}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
