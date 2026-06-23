import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ParentId } from '@/core/domain/parent';
import { useCreateGoal } from '@/core/services/usecases/goal/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import {
  AssistidoPickerField,
  resolveInitialFormParentId,
} from '@/ui/Forms/AssistidoPickerField';

import { getGoalErrorMessage } from '../goals-api-error';

type CreateGoalSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_TITLE_LENGTH = 100;
const MIN_TARGET_AMOUNT = 10;

export function CreateGoalSheet({ visible, onClose }: CreateGoalSheetProps) {
  const { t } = useTranslation();
  const { parentId, parents } = useAssistido();
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [formParentId, setFormParentId] = useState<ParentId | null>(null);

  useEffect(() => {
    if (visible) {
      setFormParentId(resolveInitialFormParentId(parentId, parents, true));
    }
  }, [visible, parentId, parents]);

  function handleClose() {
    setTitle('');
    setTargetAmount('');
    setFormParentId(null);
    createGoal.reset();
    onClose();
  }

  function handleSubmit() {
    const parsedAmount = Number(targetAmount.replace(',', '.'));

    createGoal.mutate(
      {
        title: title.trim(),
        targetAmount: parsedAmount,
        parentId: formParentId,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const parsedAmount = Number(targetAmount.replace(',', '.'));
  const isValid =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount >= MIN_TARGET_AMOUNT;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('goals.newGoal')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('goals.newGoal')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        {t('goals.createDescription')}
      </Text>

      <View className="mt-6">
        <AssistidoPickerField
          allowAll
          label={t('goals.assistidoLabel')}
          parents={parents}
          value={formParentId}
          onChange={setFormParentId}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">{t('goals.titleLabel')}</Text>
        <TextInput
          accessibilityLabel={t('goals.titleAccessibility')}
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_TITLE_LENGTH}
          placeholder={t('goals.titlePlaceholder')}
          placeholderTextColor={colors.mindfulBrown60}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">{t('goals.targetAmount')}</Text>
        <TextInput
          accessibilityLabel={t('goals.targetAmountAccessibility')}
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          keyboardType="decimal-pad"
          placeholder={t('goals.targetAmountPlaceholder')}
          placeholderTextColor={colors.mindfulBrown60}
          value={targetAmount}
          onChangeText={setTargetAmount}
        />
        <Text className="mt-1 font-sans text-xs text-mindful-brown/50">
          {t('common.minimum', { amount: MIN_TARGET_AMOUNT.toFixed(2) })}
        </Text>
      </View>

      {createGoal.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getGoalErrorMessage(createGoal.error)}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('goals.createGoalAccessibility')}
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={!isValid || createGoal.isPending}
        onPress={handleSubmit}
      >
        {createGoal.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">{t('goals.createGoal')}</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
