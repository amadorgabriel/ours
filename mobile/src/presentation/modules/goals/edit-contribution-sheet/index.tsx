import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';

import type { GoalContribution } from '@/core/domain/goal';
import { useUpdateGoalContribution } from '@/core/services/usecases/goal/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAppAlert } from '@/presentation/providers/alert';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { SheetTextInput } from '@/ui/Forms/SheetTextInput';

import { getContributionErrorMessage } from '../goals-api-error';

type EditContributionSheetProps = {
  visible: boolean;
  goalId: string;
  contribution: GoalContribution | null;
  onClose: () => void;
};

const MIN_AMOUNT = 1;

export function EditContributionSheet({
  visible,
  goalId,
  contribution,
  onClose,
}: EditContributionSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const updateContribution = useUpdateGoalContribution(goalId);
  const [amount, setAmount] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (visible && contribution) {
      setAmount(contribution.amount?.toString() ?? '');
      setIsPrivate(contribution.isPrivate);
    }
  }, [visible, contribution]);

  function handleClose() {
    setAmount('');
    setIsPrivate(false);
    updateContribution.reset();
    onClose();
  }

  function handleSave() {
    if (!contribution) return;

    const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
    if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_AMOUNT) {
      alert(t('alerts.invalidAmount.title'), t('alerts.invalidAmount.message'));
      return;
    }

    updateContribution.mutate(
      {
        contributionId: contribution.id,
        data: { amount: parsedAmount, isPrivate },
      },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: (error) => {
          alert(t('alerts.deleteContribution.errorSave'), getContributionErrorMessage(error));
        },
      }
    );
  }

  if (!contribution) {
    return null;
  }

  const parsedAmount = Number(amount.replace(',', '.'));
  const isValid = !Number.isNaN(parsedAmount) && parsedAmount >= MIN_AMOUNT;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('goals.editContribution')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">
        {t('goals.editContribution')}
      </Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">{t('goals.amount')}</Text>
        <SheetTextInput
          accessibilityLabel={t('goals.amountAccessibility')}
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          keyboardType="decimal-pad"
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

      <View className="mt-4 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          className="flex-1 items-center rounded-xl border border-mindful-brown/20 py-3"
          onPress={handleClose}
        >
          <Text className="font-sans-semibold text-mindful-brown">{t('common.cancel')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="flex-1 items-center rounded-xl bg-serenity-green py-3"
          disabled={!isValid || updateContribution.isPending}
          onPress={handleSave}
        >
          {updateContribution.isPending ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text className="font-sans-semibold text-light">{t('common.save')}</Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
