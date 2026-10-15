import { useTranslation } from '@/presentation/hooks/use-translation';
import { pickCompressedVisitPhoto, type VisitPhotoSource } from '@/presentation/modules/feed/pick-visit-photo';
import { useAppAlert } from '@/presentation/providers/alert';

export type PickedVisitPhoto = {
  base64: string;
  mimeType: string;
};

export function useVisitPhotoPicker() {
  const { t } = useTranslation();
  const { alert } = useAppAlert();

  async function pickPhoto(source: VisitPhotoSource, deliver: (photo: PickedVisitPhoto) => void) {
    try {
      const photo = await pickCompressedVisitPhoto(source, () => {
        alert(
          t('alerts.galleryPermission.title'),
          source === 'camera'
            ? t('alerts.cameraPermission.visitMessage')
            : t('alerts.galleryPermission.visitMessage')
        );
      });
      if (!photo) return;
      deliver(photo);
    } catch {
      alert(t('alerts.photoError.title'), t('alerts.photoError.processMessage'));
    }
  }

  function choosePhoto(deliver: (photo: PickedVisitPhoto) => void) {
    alert(t('visit.photoSourceTitle'), undefined, [
      {
        text: t('visit.photoGallery'),
        style: 'cancel',
        onPress: () => {
          void pickPhoto('library', deliver);
        },
      },
      {
        text: t('visit.photoCamera'),
        onPress: () => {
          void pickPhoto('camera', deliver);
        },
      },
    ]);
  }

  return { choosePhoto };
}
