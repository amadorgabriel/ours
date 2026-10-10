import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

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
  /** One-line portrait choice. Used by ligação and visita. */
  inline?: boolean;
};

function firstName(name: string): string {
  const [given] = name.trim().split(/\s+/);
  return given || name;
}

function AssistidoPortrait({ parent, size }: { parent: ParentSummary; size: 'sm' | 'md' }) {
  const { t } = useTranslation();
  const dimension = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  if (parent.photoData) {
    return (
      <Image
        accessibilityLabel={t('profile.parentPhoto', { name: parent.name })}
        className={`${dimension} rounded-full`}
        source={{ uri: parent.photoData }}
      />
    );
  }

  return (
    <View className={`${dimension} items-center justify-center rounded-full bg-mindful-brown/15`}>
      <Text className="font-sans-semibold text-sm text-mindful-brown">
        {parent.name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

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
  inline = false,
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

  if (inline && !allowAll) {
    return (
      <View>
        <Text className="font-sans text-sm text-mindful-brown">{fieldLabel}</Text>
        {parents.length === 0 ? (
          <Text className="mt-2 font-sans text-sm text-mindful-brown/70">
            {t('assistidoPicker.emptyDescription')}
          </Text>
        ) : parents.length === 1 ? (
          <View className="mt-2 flex-row items-center rounded-xl bg-white px-4 py-3">
            <AssistidoPortrait parent={parents[0]} size="md" />
            <View className="ml-3 flex-1">
              <Text className="font-sans-semibold text-mindful-brown">{parents[0].name}</Text>
              <Text className="font-sans text-sm text-mindful-brown/70">
                {relationshipLabel(parents[0].relationship)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mt-2 flex-row gap-1 rounded-2xl bg-white p-1">
            {parents.map((parent) => {
              const isSelected = parent.id === value;
              return (
                <Pressable
                  key={parent.id}
                  accessibilityRole="button"
                  accessibilityLabel={t('assistidoPicker.selectAccessibility', { name: parent.name })}
                  accessibilityState={{ selected: isSelected }}
                  className={`h-14 min-w-0 flex-1 flex-row items-center gap-1.5 rounded-xl px-1.5 ${
                    isSelected ? 'bg-serenity-green/15' : ''
                  }`}
                  onPress={() => onChange(parent.id)}
                >
                  <AssistidoPortrait parent={parent} size="sm" />
                  <Text
                    className={`flex-1 font-sans-semibold text-sm ${
                      isSelected ? 'text-serenity-green' : 'text-mindful-brown'
                    }`}
                    numberOfLines={1}
                  >
                    {firstName(parent.name)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {!displayName && parents.length > 1 && requiredHint ? (
          <Text className="mt-1 font-sans text-xs text-mindful-brown/60">{requiredHint}</Text>
        ) : null}
      </View>
    );
  }

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
