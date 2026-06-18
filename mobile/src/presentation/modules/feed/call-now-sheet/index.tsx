import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRegisterCall } from '@/core/services/usecases/activity/index.hooks';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type CallNowSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_NOTES_LENGTH = 500;

export function CallNowSheet({ visible, onClose }: CallNowSheetProps) {
  const { parentId, activeParent } = useAssistido();
  const registerCall = useRegisterCall();
  const [notes, setNotes] = useState('');

  function handleClose() {
    setNotes('');
    registerCall.reset();
    onClose();
  }

  function handleSubmit() {
    registerCall.mutate(
      {
        parentId: parentId ?? undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const assistidoLabel = activeParent?.name ?? 'Nenhum assistido selecionado';

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Registrar ligação">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Liguei agora</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Registre que você ligou para o assistido agora.
      </Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">Assistido</Text>
        <View className="mt-2 rounded-xl bg-white px-4 py-3">
          <Text className="font-sans-semibold text-mindful-brown">{assistidoLabel}</Text>
          {!activeParent ? (
            <Text className="mt-1 font-sans text-xs text-mindful-brown/60">
              Você pode selecionar um assistido no header quando estiverem cadastrados.
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">Notas (opcional)</Text>
        <TextInput
          accessibilityLabel="Notas da ligação"
          className="mt-2 min-h-[96px] rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_NOTES_LENGTH}
          multiline
          placeholder="Como foi a conversa?"
          placeholderTextColor={colors.mindfulBrown60}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />
        <Text className="mt-1 text-right font-sans text-xs text-mindful-brown/50">
          {notes.length}/{MAX_NOTES_LENGTH}
        </Text>
      </View>

      {registerCall.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          Não foi possível registrar a ligação. Tente novamente.
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Registrar ligação"
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={registerCall.isPending}
        onPress={handleSubmit}
      >
        {registerCall.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">Registrar</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
