import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRegisterCall } from '@/core/services/usecases/activity/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type CallNowSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_NOTES_LENGTH = 500;

export function CallNowSheet({ visible, onClose }: CallNowSheetProps) {
  const { t } = useTranslation();
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

  const assistidoLabel = activeParent?.name ?? t('call.noAssistido');

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('call.sheetAccessibility')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('call.title')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{t('call.description')}</Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">{t('common.assistido')}</Text>
        <View className="mt-2 rounded-xl bg-white px-4 py-3">
          <Text className="font-sans-semibold text-mindful-brown">{assistidoLabel}</Text>
          {!activeParent ? (
            <Text className="mt-1 font-sans text-xs text-mindful-brown/60">
              {t('call.selectAssistidoHint')}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">{t('call.notes')}</Text>
        <TextInput
          accessibilityLabel={t('call.notesAccessibility')}
          className="mt-2 min-h-[96px] rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_NOTES_LENGTH}
          multiline
          placeholder={t('call.notesPlaceholder')}
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
          {t('errors.activity.registerCallFailed')}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('call.sheetAccessibility')}
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={registerCall.isPending}
        onPress={handleSubmit}
      >
        {registerCall.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">{t('common.register')}</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
