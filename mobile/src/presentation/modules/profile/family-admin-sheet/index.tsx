import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { useDeleteFamily, useUpdateFamily } from '@/core/services/usecases/family/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { getFamilyErrorMessage } from '@/presentation/modules/family/family-api-error';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type FamilyAdminSheetProps = {
  visible: boolean;
  familyName: string;
  onClose: () => void;
  onDeleted: () => void;
};

export function FamilyAdminSheet({
  visible,
  familyName,
  onClose,
  onDeleted,
}: FamilyAdminSheetProps) {
  const { t } = useTranslation();
  const updateFamily = useUpdateFamily();
  const deleteFamily = useDeleteFamily();
  const [name, setName] = useState(familyName);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    setName(familyName);
  }, [familyName]);

  function handleClose() {
    setName(familyName);
    setDeleteStep(0);
    setConfirmName('');
    updateFamily.reset();
    deleteFamily.reset();
    onClose();
  }

  function handleSaveName() {
    updateFamily.mutate(
      { name: name.trim() },
      {
        onSuccess: () => handleClose(),
      }
    );
  }

  function handleDelete() {
    deleteFamily.mutate(
      { confirmName: confirmName.trim() },
      {
        onSuccess: () => {
          handleClose();
          onDeleted();
        },
      }
    );
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('profile.familyAdminAccessibility')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('profile.familyTitle')}</Text>

      {deleteStep === 0 ? (
        <>
          <Text className="mt-4 font-sans text-sm text-mindful-brown/70">{t('profile.familyName')}</Text>
          <TextInput
            accessibilityLabel={t('profile.familyNameAccessibility')}
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown"
            maxLength={100}
            value={name}
            onChangeText={setName}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.saveFamilyNameAccessibility')}
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            disabled={updateFamily.isPending || !name.trim()}
            onPress={handleSaveName}
          >
            {updateFamily.isPending ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">{t('common.save')}</Text>
            )}
          </Pressable>
          {updateFamily.isError ? (
            <Text className="mt-3 font-sans text-sm text-red-600">
              {getFamilyErrorMessage(updateFamily.error, 'create')}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.deleteFamilyAccessibility')}
            className="mt-6 items-center rounded-xl border border-red-500 py-3"
            onPress={() => setDeleteStep(1)}
          >
            <Text className="font-sans-semibold text-red-600">{t('profile.deleteFamily')}</Text>
          </Pressable>
        </>
      ) : null}

      {deleteStep === 1 ? (
        <>
          <Text className="mt-4 font-sans text-sm text-mindful-brown/80">
            {t('profile.deleteFamilyWarning')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.continueDeleteAccessibility')}
            className="mt-4 items-center rounded-xl border border-red-500 py-3"
            onPress={() => setDeleteStep(2)}
          >
            <Text className="font-sans-semibold text-red-600">{t('common.continue')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.cancelDeleteAccessibility')}
            className="mt-3 items-center py-2"
            onPress={() => setDeleteStep(0)}
          >
            <Text className="font-sans-semibold text-mindful-brown">{t('common.cancel')}</Text>
          </Pressable>
        </>
      ) : null}

      {deleteStep === 2 ? (
        <>
          <Text className="mt-4 font-sans text-sm text-mindful-brown/80">
            {t('profile.confirmDeleteHint', { name: familyName })}
          </Text>
          <TextInput
            accessibilityLabel={t('profile.confirmFamilyNameAccessibility')}
            className="mt-2 rounded-xl border border-mindful-brown/20 bg-cream px-4 py-3 font-sans text-mindful-brown"
            value={confirmName}
            onChangeText={setConfirmName}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.confirmDeleteAccessibility')}
            className="mt-4 items-center rounded-xl bg-red-600 py-3"
            disabled={deleteFamily.isPending || confirmName.trim() !== familyName}
            onPress={handleDelete}
          >
            {deleteFamily.isPending ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">{t('profile.deletePermanently')}</Text>
            )}
          </Pressable>
          {deleteFamily.isError ? (
            <Text className="mt-3 font-sans text-sm text-red-600">
              {getFamilyErrorMessage(deleteFamily.error, 'create')}
            </Text>
          ) : null}
        </>
      ) : null}
    </BottomSheet>
  );
}
