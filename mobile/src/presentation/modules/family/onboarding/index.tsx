import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { t } from '@/core/infra/i18n';
import { useCreateFamily, useJoinFamily } from '@/core/services/usecases/family/index.hooks';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';

import { getFamilyErrorMessage } from '../family-api-error';

const MAX_NAME_LENGTH = 100;
const INVITE_CODE_LENGTH = 6;

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return t('errors.family.nameRequired');
  if (trimmed.length > MAX_NAME_LENGTH) {
    return t('errors.family.nameMaxLength', { max: MAX_NAME_LENGTH });
  }
  return null;
}

function validateCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return t('errors.family.inviteCodeRequired');
  if (trimmed.length !== INVITE_CODE_LENGTH) {
    return t('errors.family.inviteCodeLength', { length: INVITE_CODE_LENGTH });
  }
  return null;
}

export function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const createFamily = useCreateFamily();
  const joinFamily = useJoinFamily();

  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createValidationError, setCreateValidationError] = useState<string | null>(null);
  const [joinValidationError, setJoinValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof invite === 'string' && invite.trim()) {
      setInviteCode(invite.trim().toUpperCase());
    }
  }, [invite]);

  function navigateHome() {
    router.replace(mobileRoutes.home as Href);
  }

  function handleCreate() {
    const validationError = validateName(familyName);
    setCreateValidationError(validationError);
    if (validationError) return;

    createFamily.mutate({ name: familyName.trim() }, { onSuccess: navigateHome });
  }

  function handleJoin() {
    const validationError = validateCode(inviteCode);
    setJoinValidationError(validationError);
    if (validationError) return;

    joinFamily.mutate({ inviteCode }, { onSuccess: navigateHome });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerClassName="grow px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-sans-semibold text-2xl text-mindful-brown">{t('onboarding.welcome')}</Text>
        <Text className="mt-2 font-sans text-base text-mindful-brown/80">{t('onboarding.description')}</Text>

        <View className="mt-8 rounded-2xl bg-white p-5">
          <Text className="font-sans-semibold text-lg text-mindful-brown">{t('onboarding.createFamily')}</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
            {t('onboarding.createFamilyAdminHint')}
          </Text>
          <Text className="mt-4 font-sans text-sm text-mindful-brown">{t('onboarding.familyName')}</Text>
          <TextInput
            accessibilityLabel={t('onboarding.familyNameAccessibility')}
            autoCapitalize="words"
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown"
            maxLength={MAX_NAME_LENGTH}
            placeholder={t('common.placeholderFamilyNameLong')}
            placeholderTextColor={`${colors.mindfulBrown60}80`}
            value={familyName}
            onChangeText={(value) => {
              setFamilyName(value);
              setCreateValidationError(null);
              createFamily.reset();
            }}
          />
          {createValidationError && (
            <Text className="mt-2 font-sans text-sm text-red-600">{createValidationError}</Text>
          )}
          {createFamily.isError && (
            <Text className="mt-2 font-sans text-sm text-red-600">
              {getFamilyErrorMessage(createFamily.error, 'create')}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            disabled={createFamily.isPending}
            onPress={handleCreate}
          >
            {createFamily.isPending ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">{t('onboarding.createFamily')}</Text>
            )}
          </Pressable>
        </View>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-mindful-brown/20" />
          <Text className="font-sans text-sm text-mindful-brown/60">{t('common.or')}</Text>
          <View className="h-px flex-1 bg-mindful-brown/20" />
        </View>

        <View className="rounded-2xl bg-white p-5">
          <Text className="font-sans-semibold text-lg text-mindful-brown">{t('onboarding.joinWithCode')}</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">{t('onboarding.joinWithCodeHint')}</Text>
          <Text className="mt-4 font-sans text-sm text-mindful-brown">{t('onboarding.inviteCode')}</Text>
          <TextInput
            accessibilityLabel={t('onboarding.inviteCodeAccessibility')}
            autoCapitalize="characters"
            autoCorrect={false}
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown tracking-widest"
            maxLength={INVITE_CODE_LENGTH}
            placeholder={t('common.placeholderInviteCode')}
            placeholderTextColor={`${colors.mindfulBrown60}80`}
            value={inviteCode}
            onChangeText={(value) => {
              setInviteCode(value.toUpperCase());
              setJoinValidationError(null);
              joinFamily.reset();
            }}
          />
          {joinValidationError && (
            <Text className="mt-2 font-sans text-sm text-red-600">{joinValidationError}</Text>
          )}
          {joinFamily.isError && (
            <Text className="mt-2 font-sans text-sm text-red-600">
              {getFamilyErrorMessage(joinFamily.error, 'join')}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            className="mt-4 items-center rounded-xl border border-serenity-green py-3"
            disabled={joinFamily.isPending}
            onPress={handleJoin}
          >
            {joinFamily.isPending ? (
              <ActivityIndicator color={colors.serenityGreen60} />
            ) : (
              <Text className="font-sans-semibold text-serenity-green">{t('onboarding.joinFamily')}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
