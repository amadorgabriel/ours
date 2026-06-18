import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
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

import { useCreateFamily, useJoinFamily } from '@/core/services/usecases/family/index.hooks';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { colors } from '@/presentation/styles/tokens';

import { getFamilyErrorMessage } from '../family-api-error';

const MAX_NAME_LENGTH = 100;
const INVITE_CODE_LENGTH = 6;

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Informe o nome da família.';
  if (trimmed.length > MAX_NAME_LENGTH) return `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`;
  return null;
}

function validateCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return 'Informe o código de convite.';
  if (trimmed.length !== INVITE_CODE_LENGTH) return `O código deve ter ${INVITE_CODE_LENGTH} caracteres.`;
  return null;
}

export function OnboardingScreen() {
  const router = useRouter();
  const createFamily = useCreateFamily();
  const joinFamily = useJoinFamily();

  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createValidationError, setCreateValidationError] = useState<string | null>(null);
  const [joinValidationError, setJoinValidationError] = useState<string | null>(null);

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
        <Text className="font-sans-semibold text-2xl text-mindful-brown">Bem-vindo</Text>
        <Text className="mt-2 font-sans text-base text-mindful-brown/80">
          Crie sua família ou entre com um código de convite.
        </Text>

        <View className="mt-8 rounded-2xl bg-white p-5">
          <Text className="font-sans-semibold text-lg text-mindful-brown">Criar família</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
            Você será o administrador da família.
          </Text>
          <Text className="mt-4 font-sans text-sm text-mindful-brown">Nome da família</Text>
          <TextInput
            accessibilityLabel="Nome da família"
            autoCapitalize="words"
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown"
            maxLength={MAX_NAME_LENGTH}
            placeholder="Ex.: Família Silva"
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
              <Text className="font-sans-semibold text-light">Criar família</Text>
            )}
          </Pressable>
        </View>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-mindful-brown/20" />
          <Text className="font-sans text-sm text-mindful-brown/60">ou</Text>
          <View className="h-px flex-1 bg-mindful-brown/20" />
        </View>

        <View className="rounded-2xl bg-white p-5">
          <Text className="font-sans-semibold text-lg text-mindful-brown">Entrar com código</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
            Peça o código de 6 caracteres a quem administra a família.
          </Text>
          <Text className="mt-4 font-sans text-sm text-mindful-brown">Código de convite</Text>
          <TextInput
            accessibilityLabel="Código de convite"
            autoCapitalize="characters"
            autoCorrect={false}
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown tracking-widest"
            maxLength={INVITE_CODE_LENGTH}
            placeholder="ABC123"
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
              <Text className="font-sans-semibold text-serenity-green">Entrar na família</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
