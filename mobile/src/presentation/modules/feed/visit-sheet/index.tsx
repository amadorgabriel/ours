import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRegisterVisit } from '@/core/services/usecases/activity/index.hooks';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type VisitSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function toIsoDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function pickCompressedPhoto(): Promise<{ base64: string; mimeType: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Permissão necessária',
      'Permita o acesso à galeria nas configurações do dispositivo para adicionar uma foto.'
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipulated.base64) {
    return null;
  }

  return {
    base64: `data:image/jpeg;base64,${manipulated.base64}`,
    mimeType: 'image/jpeg',
  };
}

export function VisitSheet({ visible, onClose }: VisitSheetProps) {
  const { parentId, activeParent } = useAssistido();
  const registerVisit = useRegisterVisit();
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(toIsoDateInput(new Date()));
  const [endDate, setEndDate] = useState(toIsoDateInput(new Date()));
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | undefined>();

  function resetForm() {
    setAllDay(true);
    setStartDate(toIsoDateInput(new Date()));
    setEndDate(toIsoDateInput(new Date()));
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoMimeType(undefined);
    registerVisit.reset();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handlePickPhoto() {
    const photo = await pickCompressedPhoto();
    if (!photo) return;

    setPhotoPreview(photo.base64);
    setPhotoBase64(photo.base64);
    setPhotoMimeType(photo.mimeType);
  }

  function handleSubmit() {
    const startAt = new Date(`${startDate}T00:00:00`);
    const endAt = allDay ? undefined : new Date(`${endDate}T23:59:59`);

    registerVisit.mutate(
      {
        parentId: parentId ?? undefined,
        allDay,
        startAt: startAt.toISOString(),
        endAt: endAt?.toISOString(),
        photoBase64: photoBase64 ?? undefined,
        mimeType: photoMimeType,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const assistidoLabel = activeParent?.name ?? 'Todos os assistidos';

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Registrar visita">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Registrar visita</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Registre uma visita presencial com período e foto opcional.
      </Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">Assistido</Text>
        <View className="mt-2 rounded-xl bg-white px-4 py-3">
          <Text className="font-sans-semibold text-mindful-brown">{assistidoLabel}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between rounded-xl bg-white px-4 py-3">
        <Text className="font-sans text-sm text-mindful-brown">Dia inteiro</Text>
        <Switch
          accessibilityLabel="Visita dia inteiro"
          value={allDay}
          onValueChange={setAllDay}
        />
      </View>

      <View className="mt-4">
        <Text className="font-sans text-sm text-mindful-brown">Início</Text>
        <TextInput
          accessibilityLabel="Data de início"
          className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.mindfulBrown60}
          value={startDate}
          onChangeText={setStartDate}
        />
      </View>

      {!allDay ? (
        <View className="mt-4">
          <Text className="font-sans text-sm text-mindful-brown">Fim</Text>
          <TextInput
            accessibilityLabel="Data de fim"
            className="mt-2 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.mindfulBrown60}
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escolher foto da galeria"
        className="mt-4 items-center rounded-xl border border-serenity-green py-3"
        onPress={() => void handlePickPhoto()}
      >
        <Text className="font-sans-semibold text-serenity-green">
          {photoPreview ? 'Trocar foto' : 'Adicionar foto'}
        </Text>
      </Pressable>

      {photoPreview ? (
        <Image
          accessibilityLabel="Prévia da foto da visita"
          className="mt-4 h-40 w-full rounded-xl"
          resizeMode="cover"
          source={{ uri: photoPreview }}
        />
      ) : null}

      {registerVisit.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">
          Não foi possível registrar a visita. Tente novamente.
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Registrar visita"
        className="mt-4 items-center rounded-xl bg-serenity-green py-3"
        disabled={registerVisit.isPending}
        onPress={handleSubmit}
      >
        {registerVisit.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">Registrar</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
