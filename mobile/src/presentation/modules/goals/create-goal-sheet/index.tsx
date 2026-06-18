import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useCreateGoal } from '@/core/services/usecases/goal/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

import { getGoalErrorMessage } from '../goals-api-error';

type CreateGoalSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_TITLE_LENGTH = 100;
const MIN_TARGET_AMOUNT = 10;

export function CreateGoalSheet({ visible, onClose }: CreateGoalSheetProps) {
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  function handleClose() {
    setTitle('');
    setTargetAmount('');
    createGoal.reset();
    onClose();
  }

  function handleSubmit() {
    const parsedAmount = Number(targetAmount.replace(',', '.'));

    createGoal.mutate(
      {
        title: title.trim(),
        targetAmount: parsedAmount,
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
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Nova meta">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Nova meta</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Defina um objetivo financeiro para o cuidado da família.
      </Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">Título</Text>
        <TextInput
          accessibilityLabel="Título da meta"
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_TITLE_LENGTH}
          placeholder="Ex.: Reserva de emergência"
          placeholderTextColor={colors.mindfulBrown60}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">Valor alvo (R$)</Text>
        <TextInput
          accessibilityLabel="Valor alvo"
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          keyboardType="decimal-pad"
          placeholder="Ex.: 500"
          placeholderTextColor={colors.mindfulBrown60}
          value={targetAmount}
          onChangeText={setTargetAmount}
        />
        <Text className="mt-1 font-sans text-xs text-mindful-brown/50">
          Mínimo R$ {MIN_TARGET_AMOUNT.toFixed(2)}
        </Text>
      </View>

      {createGoal.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getGoalErrorMessage(createGoal.error)}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Criar meta"
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={!isValid || createGoal.isPending}
        onPress={handleSubmit}
      >
        {createGoal.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">Criar meta</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
