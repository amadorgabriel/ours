import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ParentId, ParentSummary } from '@/core/domain/parent';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { relationshipLabel } from '@/presentation/modules/family/relationship-label';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

type AssistidoPickerFieldProps = {
  parents: ParentSummary[];
  value: ParentId | null;
  onChange: (parentId: ParentId | null) => void;
  label?: string;
  requiredHint?: string;
  allowAll?: boolean;
};

function ParentOption({
  parent,
  isSelected,
  onSelect,
}: {
  parent: ParentSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('assistidoPicker.selectAccessibility', { name: parent.name })}
      accessibilityState={{ selected: isSelected }}
      className={`mb-2 flex-row items-center rounded-xl px-4 py-3 ${
        isSelected ? 'bg-serenity-green/15' : 'bg-white'
      }`}
      onPress={onSelect}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
        <Text className="font-sans-semibold text-mindful-brown">
          {parent.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-mindful-brown">{parent.name}</Text>
        <Text className="font-sans text-sm text-mindful-brown/70">
          {relationshipLabel(parent.relationship)}
        </Text>
      </View>
    </Pressable>
  );
}

export function resolveInitialFormParentId(
  globalParentId: ParentId | null,
  parents: ParentSummary[],
  allowAll = false
): ParentId | null {
  if (globalParentId) {
    return globalParentId;
  }

  if (allowAll) {
    return null;
  }

  if (parents.length === 1) {
    return parents[0].id;
  }

  return null;
}

export function AssistidoPickerField({
  parents,
  value,
  onChange,
  label,
  requiredHint,
  allowAll = false,
}: AssistidoPickerFieldProps) {
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);

  const selectedParent = useMemo(
    () => (value ? parents.find((parent) => parent.id === value) ?? null : null),
    [parents, value]
  );

  const fieldLabel = label ?? t('common.assistido');
  const displayName =
    selectedParent?.name ?? (allowAll && value === null ? t('common.all') : null);

  return (
    <>
      <View>
        <Text className="font-sans text-sm text-mindful-brown">{fieldLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('assistidoPicker.openAccessibility')}
          className="mt-2 rounded-xl bg-white px-4 py-3"
          onPress={() => setPickerVisible(true)}
        >
          <Text className="font-sans-semibold text-mindful-brown">
            {displayName ?? t('assistidoPicker.noneSelected')}
          </Text>
          {!displayName && requiredHint ? (
            <Text className="mt-1 font-sans text-xs text-mindful-brown/60">{requiredHint}</Text>
          ) : null}
        </Pressable>
      </View>

      <BottomSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        accessibilityLabel={t('assistidoPicker.sheetAccessibility')}
        scrollable
      >
        <Text className="font-sans-semibold text-xl text-mindful-brown">
          {t('assistidoPicker.sheetTitle')}
        </Text>

        {allowAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('assistidoPicker.allAccessibility')}
            accessibilityState={{ selected: value === null }}
            className={`mb-2 mt-4 flex-row items-center rounded-xl px-4 py-3 ${
              value === null ? 'bg-serenity-green/15' : 'bg-white'
            }`}
            onPress={() => {
              onChange(null);
              setPickerVisible(false);
            }}
          >
            <Text className="font-sans-semibold text-mindful-brown">{t('common.all')}</Text>
          </Pressable>
        ) : null}

        {parents.length === 0 ? (
          <EmptyState
            title={t('assistido.emptyTitle')}
            description={t('assistidoPicker.emptyDescription')}
          />
        ) : (
          parents.map((parent) => (
            <ParentOption
              key={parent.id}
              parent={parent}
              isSelected={parent.id === value}
              onSelect={() => {
                onChange(parent.id);
                setPickerVisible(false);
              }}
            />
          ))
        )}
      </BottomSheet>
    </>
  );
}
