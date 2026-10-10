import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type VisitPhotoSource = 'library' | 'camera';

export async function pickCompressedVisitPhoto(
  source: VisitPhotoSource,
  onPermissionDenied: () => void
): Promise<{ base64: string; mimeType: string } | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    onPermissionDenied();
    return null;
  }

  const options = {
    mediaTypes: ['images'] as const,
    quality: 0.8,
    base64: true,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

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
