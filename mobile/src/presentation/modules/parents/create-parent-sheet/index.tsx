import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PARENT_RELATIONSHIPS, type ParentRelationship } from '@/core/domain/parent';
import { useCreateParent } from '@/core/services/usecases/parent/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

import { getParentErrorMessage } from '../parents-api-error';

type CreateParentSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_NAME_LENGTH = 100;

function RelationshipOption({
  label,
  selected,
  onSelect,
}: {
  label: ParentRelationship;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Relação ${label}`}
      accessibilityState={{ selected }}
      className={`mr-2 rounded-full px-4 py-2 ${
        selected ? 'bg-serenity-green' : 'bg-white'
      }`}
      onPress={onSelect}
    >
      <Text className={`font-sans-semibold text-sm ${selected ? 'text-light' : 'text-mindful-brown'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function CreateParentSheet({ visible, onClose }: CreateParentSheetProps) {
  const createParent = useCreateParent();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<ParentRelationship>('Pai');
  const [birthDate, setBirthDate] = useState('');

  function handleClose() {
    setName('');
    setRelationship('Pai');
    setBirthDate('');
    createParent.reset();
    onClose();
  }

  function handleSubmit() {
    createParent.mutate(
      {
        name: name.trim(),
        relationship,
        birthDate: birthDate.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const isValid = name.trim().length > 0 && name.trim().length <= MAX_NAME_LENGTH;

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Novo assistido" scrollable>
      <Text className="font-sans-semibold text-xl text-mindful-brown">Novo assistido</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Cadastre quem a família cuida (Pai, Mãe ou outro).
      </Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">Nome</Text>
        <TextInput
          accessibilityLabel="Nome do assistido"
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_NAME_LENGTH}
          placeholder="Ex.: João Silva"
          placeholderTextColor={colors.mindfulBrown60}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">Relação</Text>
        <View className="mt-2 flex-row flex-wrap">
          {PARENT_RELATIONSHIPS.map((option) => (
            <RelationshipOption
              key={option}
              label={option}
              selected={relationship === option}
              onSelect={() => setRelationship(option)}
            />
          ))}
        </View>
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">Data de nascimento (opcional)</Text>
        <TextInput
          accessibilityLabel="Data de nascimento"
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.mindfulBrown60}
          value={birthDate}
          onChangeText={setBirthDate}
        />
      </View>

      {createParent.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getParentErrorMessage(createParent.error, 'create')}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cadastrar assistido"
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={!isValid || createParent.isPending}
        onPress={handleSubmit}
      >
        {createParent.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">Cadastrar</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
