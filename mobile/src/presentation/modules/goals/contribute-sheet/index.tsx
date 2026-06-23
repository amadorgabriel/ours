import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ParentId } from '@/core/domain/parent';
import { useCreateGoalContribution } from '@/core/services/usecases/goal/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import {
  AssistidoPickerField,
  resolveInitialFormParentId,
} from '@/ui/Forms/AssistidoPickerField';

import { getContributionErrorMessage } from '../goals-api-error';

type ContributeSheetProps = {
  visible: boolean;
  goalId: string;
  onClose: () => void;
};

const MIN_AMOUNT = 1;

export function ContributeSheet({ visible, goalId, onClose }: ContributeSheetProps) {
  const { t } = useTranslation();
  const { parentId, parents } = useAssistido();
  const createContribution = useCreateGoalContribution(goalId);
  const [amount, setAmount] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [formParentId, setFormParentId] = useState<ParentId | null>(null);

  useEffect(() => {
    if (visible) {
      setFormParentId(resolveInitialFormParentId(parentId, parents));
    }
  }, [visible, parentId, parents]);

  function handleClose() {
    setAmount('');
    setIsPrivate(false);
    createContribution.reset();
    onClose();
  }

  function handleSubmit() {
    if (!formParentId) {
      return;
    }

    const parsedAmount = Number(amount.replace(',', '.'));

    createContribution.mutate(
      {
        amount: parsedAmount,
        isPrivate,
        parentId: formParentId,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const parsedAmount = Number(amount.replace(',', '.'));
  const isValidAmount = !Number.isNaN(parsedAmount) && parsedAmount >= MIN_AMOUNT;
  const canSubmit = isValidAmount && Boolean(formParentId) && !createContribution.isPending;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('goals.contributeSheetAccessibility')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('goals.contribute')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        {t('goals.contributeDescription')}
      </Text>

      <View className="mt-6">
        <AssistidoPickerField
          parents={parents}
          requiredHint={t('assistidoPicker.requiredHint')}
          value={formParentId}
          onChange={setFormParentId}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">{t('goals.amount')}</Text>
        <TextInput
          accessibilityLabel={t('goals.amountAccessibility')}
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          keyboardType="decimal-pad"
          placeholder={t('goals.amountPlaceholder')}
          placeholderTextColor={colors.mindfulBrown60}
          value={amount}
          onChangeText={setAmount}
        />
        <Text className="mt-1 font-sans text-xs text-mindful-brown/50">
          {t('common.minimum', { amount: MIN_AMOUNT.toFixed(2) })}
        </Text>
      </View>

      <View className="mt-4 flex-row items-center justify-between rounded-xl bg-white/80 px-4 py-3">
        <View className="flex-1 pr-4">
          <Text className="font-sans text-sm text-mindful-brown">{t('goals.privateContribution')}</Text>
          <Text className="mt-1 font-sans text-xs text-mindful-brown/60">
            {t('goals.privateContributionHint')}
          </Text>
        </View>
        <Switch
          accessibilityLabel={t('goals.privateContributionAccessibility')}
          trackColor={{ false: colors.mindfulBrown60, true: colors.serenityGreen60 }}
          thumbColor={colors.textLight}
          value={isPrivate}
          onValueChange={setIsPrivate}
        />
      </View>

      {createContribution.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getContributionErrorMessage(createContribution.error)}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('goals.registerContributionAccessibility')}
        className={`mt-4 items-center rounded-xl py-3 ${canSubmit ? 'bg-serenity-green' : 'bg-mindful-brown/30'}`}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        {createContribution.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">{t('goals.registerContribution')}</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
