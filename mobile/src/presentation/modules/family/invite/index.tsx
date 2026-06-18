import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, View } from 'react-native';

import type { CreateInviteResponse } from '@/core/domain/family';
import { useCreateInvite } from '@/core/services/usecases/family/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

import { getFamilyErrorMessage } from '../family-api-error';

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

export function InviteSheet({ visible, onClose }: InviteSheetProps) {
  const createInvite = useCreateInvite();
  const [invite, setInvite] = useState<CreateInviteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    setInvite(null);
    setCopied(false);
    createInvite.reset();
    onClose();
  }

  function handleGenerate() {
    setCopied(false);
    createInvite.mutate({}, {
      onSuccess: (result) => setInvite(result),
    });
  }

  async function handleCopy() {
    if (!invite?.inviteCode) return;

    try {
      await Clipboard.setStringAsync(invite.inviteCode);
      setCopied(true);
    } catch (error) {
      setCopied(false);
      console.error('Failed to copy invite code:', error);
    }
  }

  async function handleShare() {
    if (!invite?.inviteCode) return;

    try {
      await Share.share({
        message: `Junte-se à minha família no Ours! Código: ${invite.inviteCode}`,
      });
    } catch (error) {
      console.error('Failed to share invite code:', error);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Convidar familiar">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Convidar familiar</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Gere um código de 6 caracteres válido por 24 horas.
      </Text>

      {!invite && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gerar código"
          className="mt-6 items-center rounded-xl bg-serenity-green py-3"
          disabled={createInvite.isPending}
          onPress={handleGenerate}
        >
          {createInvite.isPending ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text className="font-sans-semibold text-light">Gerar código</Text>
          )}
        </Pressable>
      )}

      {createInvite.isError && (
        <Text className="mt-4 font-sans text-sm text-red-600">
          {getFamilyErrorMessage(createInvite.error, 'invite')}
        </Text>
      )}

      {invite && (
        <View className="mt-6">
          <Text className="font-sans text-sm text-mindful-brown">Código de convite</Text>
          <Text className="mt-2 font-sans-semibold text-3xl tracking-[0.2em] text-mindful-brown">
            {invite.inviteCode}
          </Text>
          <Text className="mt-2 font-sans text-sm text-mindful-brown/70">
            Válido até {formatExpiresAt(invite.expiresAt)}
          </Text>
          <View className="mt-4 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Copiado' : 'Copiar código'}
              className="flex-1 items-center rounded-xl border border-serenity-green py-3"
              onPress={handleCopy}
            >
              <Text className="font-sans-semibold text-serenity-green">
                {copied ? 'Copiado!' : 'Copiar'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar código"
              className="flex-1 items-center rounded-xl bg-serenity-green py-3"
              onPress={handleShare}
            >
              <Text className="font-sans-semibold text-light">Compartilhar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
