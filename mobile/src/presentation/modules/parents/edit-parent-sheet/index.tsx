import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import {
  PARENT_RELATIONSHIPS,
  type ParentRelationship,
  type ParentSummary,
} from '@/core/domain/parent';
import { useUpdateParent, useUpdateParentPhoto } from '@/core/services/usecases/parent/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

import { getParentErrorMessage } from '../parents-api-error';

type EditParentSheetProps = {
  parent: ParentSummary | null;
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

export function EditParentSheet({ parent, visible, onClose }: EditParentSheetProps) {
  const updateParent = useUpdateParent(parent?.id ?? '');
  const updatePhoto = useUpdateParentPhoto(parent?.id ?? '');
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<ParentRelationship>('Pai');
  const [birthDate, setBirthDate] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!parent) return;

    setName(parent.name);
    setRelationship(
      PARENT_RELATIONSHIPS.includes(parent.relationship as ParentRelationship)
        ? (parent.relationship as ParentRelationship)
        : 'Outro'
    );
    setBirthDate(parent.birthDate ?? '');
    setPhotoPreview(parent.photoData ?? null);
  }, [parent]);

  async function handlePickPhoto() {
    if (!parent) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 512 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipulated.base64) return;

    const photoBase64 = `data:image/jpeg;base64,${manipulated.base64}`;
    setPhotoPreview(photoBase64);
    updatePhoto.mutate({ photoBase64, mimeType: 'image/jpeg' });
  }

  function handleRemovePhoto() {
    if (!parent) return;

    setPhotoPreview(null);
    updatePhoto.mutate({ photoBase64: null });
  }

  function handleClose() {
    updateParent.reset();
    onClose();
  }

  function handleSubmit() {
    if (!parent) return;

    updateParent.mutate(
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
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Editar assistido">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Editar assistido</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Atualize nome, relação, foto ou data de nascimento.
      </Text>

      <View className="mt-6 items-center">
        {photoPreview ? (
          <Image
            accessibilityLabel="Foto do assistido"
            className="h-20 w-20 rounded-full"
            source={{ uri: photoPreview }}
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-mindful-brown/15">
            <Text className="font-sans-semibold text-2xl text-mindful-brown">
              {name.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View className="mt-3 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alterar foto"
            className="rounded-lg border border-serenity-green px-3 py-2"
            onPress={() => void handlePickPhoto()}
          >
            <Text className="font-sans-semibold text-sm text-serenity-green">Alterar foto</Text>
          </Pressable>
          {photoPreview ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remover foto"
              className="rounded-lg px-3 py-2"
              onPress={handleRemovePhoto}
            >
              <Text className="font-sans-semibold text-sm text-red-600">Remover</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

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

      {updateParent.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getParentErrorMessage(updateParent.error, 'update')}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Salvar assistido"
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={!isValid || updateParent.isPending || !parent}
        onPress={handleSubmit}
      >
        {updateParent.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">Salvar</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
