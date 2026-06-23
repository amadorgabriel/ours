import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ParentId } from '@/core/domain/parent';
import { useRegisterCall } from '@/core/services/usecases/activity/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import {
  AssistidoPickerField,
  resolveInitialFormParentId,
} from '@/ui/Forms/AssistidoPickerField';

type CallNowSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_NOTES_LENGTH = 500;

export function CallNowSheet({ visible, onClose }: CallNowSheetProps) {
  const { t } = useTranslation();
  const { parentId, parents } = useAssistido();
  const registerCall = useRegisterCall();
  const [notes, setNotes] = useState('');
  const [formParentId, setFormParentId] = useState<ParentId | null>(null);

  useEffect(() => {
    if (visible) {
      setFormParentId(resolveInitialFormParentId(parentId, parents));
    }
  }, [visible, parentId, parents]);

  function handleClose() {
    setNotes('');
    registerCall.reset();
    onClose();
  }

  function handleSubmit() {
    if (!formParentId) {
      return;
    }

    registerCall.mutate(
      {
        parentId: formParentId,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const canSubmit = Boolean(formParentId) && !registerCall.isPending;

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
        <AssistidoPickerField
          parents={parents}
          requiredHint={t('assistidoPicker.requiredHint')}
          value={formParentId}
          onChange={setFormParentId}
        />
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
        className={`mt-4 items-center rounded-xl py-3 ${canSubmit ? 'bg-serenity-green' : 'bg-mindful-brown/30'}`}
        disabled={!canSubmit}
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
