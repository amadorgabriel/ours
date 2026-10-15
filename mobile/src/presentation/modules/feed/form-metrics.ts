import { radius } from '@/presentation/styles/tokens';

/** Fixed visit photo frame. 160 is an optical preview size, not a spacing step. */
export const visitPhotoPreviewStyle = {
  width: '100%' as const,
  height: 160,
  borderRadius: radius.md,
};
