import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
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
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAppAlert } from '@/presentation/providers/alert';
import { relationshipLabel } from '@/presentation/modules/family/relationship-label';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { DatePickerField } from '@/ui/Forms/DatePickerField';
import { SheetTextInput } from '@/ui/Forms/SheetTextInput';

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
  const { t } = useTranslation();
  const displayLabel = relationshipLabel(label);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('relationships.accessibility', { label: displayLabel })}
      accessibilityState={{ selected }}
      className={`mb-2 mr-2 rounded-full px-4 py-2 ${
        selected ? 'bg-serenity-green' : 'bg-white'
      }`}
      onPress={onSelect}
    >
      <Text className={`font-sans-semibold text-sm ${selected ? 'text-light' : 'text-mindful-brown'}`}>
        {displayLabel}
      </Text>
    </Pressable>
  );
}

export function EditParentSheet({ parent, visible, onClose }: EditParentSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
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
    if (!permission.granted) {
      alert(
        t('alerts.galleryPermission.title'),
        t('alerts.galleryPermission.parentMessage')
      );
      return;
    }

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
    updatePhoto.mutate(
      { photoBase64, mimeType: 'image/jpeg' },
      {
        onError: (error) => {
          setPhotoPreview(parent.photoData ?? null);
          alert(
            t('alerts.photoError.saveMessage'),
            getParentErrorMessage(error, 'update')
          );
        },
      }
    );
  }

  function handleRemovePhoto() {
    if (!parent) return;

    setPhotoPreview(null);
    updatePhoto.mutate(
      { photoBase64: null },
      {
        onError: (error) => {
          setPhotoPreview(parent.photoData ?? null);
          alert(
            t('alerts.photoError.removeMessage'),
            getParentErrorMessage(error, 'update')
          );
        },
      }
    );
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
  const today = new Date();

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('parents.editTitle')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('parents.editTitle')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{t('parents.editDescription')}</Text>

      <View className="mt-6 items-center">
        {photoPreview ? (
          <Image
            accessibilityLabel={t('parents.photoAccessibility')}
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
            accessibilityLabel={t('parents.changePhoto')}
            className="rounded-lg border border-serenity-green px-3 py-2"
            onPress={() => void handlePickPhoto()}
          >
            <Text className="font-sans-semibold text-sm text-serenity-green">
              {t('parents.changePhoto')}
            </Text>
          </Pressable>
          {photoPreview ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('parents.removePhoto')}
              className="rounded-lg px-3 py-2"
              onPress={handleRemovePhoto}
            >
              <Text className="font-sans-semibold text-sm text-red-600">{t('parents.removePhoto')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">{t('parents.name')}</Text>
        <SheetTextInput
          accessibilityLabel={t('parents.name')}
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_NAME_LENGTH}
          placeholder={t('common.placeholderName')}
          placeholderTextColor={colors.mindfulBrown60}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">{t('parents.relationship')}</Text>
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
        <DatePickerField
          accessibilityLabel={t('parents.birthDate')}
          label={t('parents.birthDate')}
          maximumDate={today}
          value={birthDate}
          onChange={setBirthDate}
        />
      </View>

      {updateParent.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          {getParentErrorMessage(updateParent.error, 'update')}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('parents.save')}
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={!isValid || updateParent.isPending || !parent}
        onPress={handleSubmit}
      >
        {updateParent.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">{t('common.save')}</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
