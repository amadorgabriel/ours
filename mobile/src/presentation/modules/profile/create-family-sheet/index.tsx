import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { useCreateFamily } from '@/core/services/usecases/family/index.hooks';
import { getFamilyErrorMessage } from '@/presentation/modules/family/family-api-error';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type CreateFamilySheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CreateFamilySheet({ visible, onClose }: CreateFamilySheetProps) {
  const createFamily = useCreateFamily();
  const [name, setName] = useState('');

  function handleClose() {
    setName('');
    createFamily.reset();
    onClose();
  }

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    createFamily.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Nova família">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Nova família</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Crie outra família e alterne entre elas pelo header.
      </Text>

      <Text className="mt-6 font-sans text-sm text-mindful-brown">Nome da família</Text>
      <TextInput
        accessibilityLabel="Nome da família"
        className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
        maxLength={100}
        placeholder="Ex.: Silva"
        placeholderTextColor={colors.mindfulBrown60}
        value={name}
        onChangeText={setName}
      />

      {createFamily.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getFamilyErrorMessage(createFamily.error, 'create')}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Criar família"
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={createFamily.isPending || !name.trim()}
        onPress={handleSubmit}
      >
        {createFamily.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">Criar família</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
