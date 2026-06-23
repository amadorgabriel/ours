import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useCreateGoalContribution } from '@/core/services/usecases/goal/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

import { getContributionErrorMessage } from '../goals-api-error';

type ContributeSheetProps = {
  visible: boolean;
  goalId: string;
  onClose: () => void;
};

const MIN_AMOUNT = 1;

export function ContributeSheet({ visible, goalId, onClose }: ContributeSheetProps) {
  const { t } = useTranslation();
  const createContribution = useCreateGoalContribution(goalId);
  const [amount, setAmount] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  function handleClose() {
    setAmount('');
    setIsPrivate(false);
    createContribution.reset();
    onClose();
  }

  function handleSubmit() {
    const parsedAmount = Number(amount.replace(',', '.'));

    createContribution.mutate(
      {
        amount: parsedAmount,
        isPrivate,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const parsedAmount = Number(amount.replace(',', '.'));
  const isValid = !Number.isNaN(parsedAmount) && parsedAmount >= MIN_AMOUNT;

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
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={!isValid || createContribution.isPending}
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
