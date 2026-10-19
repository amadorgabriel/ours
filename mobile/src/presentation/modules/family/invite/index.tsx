import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, TextInput, View } from 'react-native';

import type { CreateInviteResponse } from '@/core/domain/family';
import { HttpClientError } from '@/core/infra/http/http-error';
import { useCreateInvite } from '@/core/services/usecases/family/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAppAlert } from '@/presentation/providers/alert';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

import { getFamilyErrorMessage } from '../family-api-error';
import { buildInviteUrl } from './invite-link';

type InviteSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function formatExpiresAt(expiresAt: string): string {
  return new Date(expiresAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isDeliverableEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(value.trim());
}

function inviteFromDeliveryFailure(error: unknown): CreateInviteResponse | null {
  if (!(error instanceof HttpClientError) || error.statusCode !== 502) {
    return null;
  }

  const data = error.data;
  if (!data || typeof data !== 'object' || !('inviteCode' in data)) {
    return null;
  }

  const inviteCode = (data as { inviteCode?: unknown }).inviteCode;
  const expiresAt = (data as { expiresAt?: unknown }).expiresAt;
  if (typeof inviteCode !== 'string' || inviteCode.length === 0) {
    return null;
  }

  return {
    inviteCode,
    expiresAt: typeof expiresAt === 'string' ? expiresAt : '',
  };
}

export function InviteSheet({ visible, onClose }: InviteSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const { familyId } = useFamily();
  const createInvite = useCreateInvite();
  const [invite, setInvite] = useState<CreateInviteResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const canGenerateInvite = Boolean(familyId);
  const shownInvite = invite ?? inviteFromDeliveryFailure(createInvite.error);

  function handleClose() {
    setInvite(null);
    setCopied(false);
    setEmailMode(false);
    setEmail('');
    setEmailError(null);
    createInvite.reset();
    onClose();
  }

  function handleLink() {
    if (!familyId) {
      return;
    }

    setCopied(false);
    setEmailError(null);
    createInvite.mutate(
      {},
      {
        onSuccess: (result) => setInvite(result),
      }
    );
  }

  function handleEmail() {
    const trimmed = email.trim();
    if (!isDeliverableEmail(trimmed)) {
      setEmailError(t('invite.invalidEmail'));
      return;
    }

    if (!familyId) {
      return;
    }

    setEmailError(null);
    setCopied(false);
    createInvite.mutate(
      { invitedEmail: trimmed },
      {
        onSuccess: (result) => setInvite(result),
      }
    );
  }

  async function handleCopy() {
    if (!shownInvite?.inviteCode) return;

    try {
      await Clipboard.setStringAsync(shownInvite.inviteCode);
      setCopied(true);
    } catch {
      alert(t('alerts.invite.copyError.title'), t('alerts.invite.copyError.message'));
    }
  }

  async function handleShare() {
    if (!shownInvite?.inviteCode) return;

    try {
      await Share.share({
        message: t('invite.shareMessage', {
          url: buildInviteUrl(shownInvite.inviteCode),
          code: shownInvite.inviteCode,
        }),
      });
    } catch {
      alert(t('alerts.invite.shareError.title'), t('alerts.invite.shareError.message'));
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('invite.title')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('invite.title')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{t('invite.description')}</Text>

      {!shownInvite && !canGenerateInvite ? (
        <Text className="mt-6 font-sans text-sm text-mindful-brown/80">{t('invite.selectFamily')}</Text>
      ) : null}

      {!shownInvite && canGenerateInvite ? (
        <View className="mt-6 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('invite.byLink')}
            className="flex-1 items-center rounded-xl bg-serenity-green py-3"
            disabled={createInvite.isPending}
            onPress={handleLink}
          >
            {createInvite.isPending && !emailMode ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">{t('invite.byLink')}</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('invite.byEmail')}
            className="flex-1 items-center rounded-xl border border-serenity-green py-3"
            disabled={createInvite.isPending}
            onPress={() => {
              setEmailMode(true);
              setEmailError(null);
            }}
          >
            <Text className="font-sans-semibold text-serenity-green">{t('invite.byEmail')}</Text>
          </Pressable>
        </View>
      ) : null}

      {!shownInvite && canGenerateInvite && emailMode ? (
        <View className="mt-4">
          <Text className="font-sans text-sm text-mindful-brown">{t('invite.emailLabel')}</Text>
          <TextInput
            accessibilityLabel={t('invite.emailAccessibility')}
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown"
            keyboardType="email-address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError(null);
            }}
          />
          {emailError ? <Text className="mt-2 font-sans text-sm text-red-600">{emailError}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('invite.sendEmail')}
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            disabled={createInvite.isPending}
            onPress={handleEmail}
          >
            <Text className="font-sans-semibold text-light">{t('invite.sendEmail')}</Text>
          </Pressable>
        </View>
      ) : null}

      {createInvite.isError && !shownInvite ? (
        <Text className="mt-4 font-sans text-sm text-red-600">
          {getFamilyErrorMessage(createInvite.error, 'invite')}
        </Text>
      ) : null}

      {shownInvite ? (
        <View className="mt-6">
          {createInvite.isError ? (
            <Text className="mb-4 font-sans text-sm text-red-600">
              {getFamilyErrorMessage(createInvite.error, 'invite')}
            </Text>
          ) : null}
          <Text className="font-sans text-sm text-mindful-brown">{t('invite.codeLabel')}</Text>
          <Text className="mt-2 font-sans-semibold text-3xl tracking-[0.2em] text-mindful-brown">
            {shownInvite.inviteCode}
          </Text>
          {shownInvite.expiresAt ? (
            <Text className="mt-2 font-sans text-sm text-mindful-brown/70">
              {t('invite.validUntil', { date: formatExpiresAt(shownInvite.expiresAt) })}
            </Text>
          ) : null}
          <Text className="mt-2 font-sans text-xs text-mindful-brown/60">
            {buildInviteUrl(shownInvite.inviteCode)}
          </Text>
          <View className="mt-4 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copied ? t('invite.copied') : t('invite.copy')}
              className="flex-1 items-center rounded-xl border border-serenity-green py-3"
              onPress={handleCopy}
            >
              <Text className="font-sans-semibold text-serenity-green">
                {copied ? t('invite.copied') : t('invite.copy')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('invite.share')}
              className="flex-1 items-center rounded-xl bg-serenity-green py-3"
              onPress={() => void handleShare()}
            >
              <Text className="font-sans-semibold text-light">{t('invite.share')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}
