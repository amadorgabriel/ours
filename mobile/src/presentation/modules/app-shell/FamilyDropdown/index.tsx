import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import type { FamilyWithRoleModel } from '@/core/domain/family';
import { roleLabel } from '@/presentation/modules/family/role-label';
import { colors } from '@/presentation/styles/tokens';

import { invalidateFamilyDependentQueries } from './invalidate-family-queries';

export type FamilyDropdownProps = {
  families: FamilyWithRoleModel[];
  familyId: string | null;
  familyName: string;
  onSelectFamily: (familyId: string) => void;
};

export function FamilyDropdown({
  families,
  familyId,
  familyName,
  onSelectFamily,
}: FamilyDropdownProps) {
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState(false);
  const isMultiFamily = families.length > 1;

  function handleSelect(nextFamilyId: string) {
    onSelectFamily(nextFamilyId);
    invalidateFamilyDependentQueries(queryClient);
    setMenuVisible(false);
  }

  if (!isMultiFamily) {
    return (
      <View
        accessibilityLabel={`Família ativa: ${familyName}`}
        className="min-h-[44px] max-w-[48%] flex-row items-center rounded-full bg-white px-3 py-2"
      >
        <Ionicons color={colors.mindfulBrown60} name="people" size={18} />
        <Text
          className="ml-2 shrink font-sans-semibold text-sm text-mindful-brown"
          numberOfLines={1}
        >
          {familyName}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Família ativa: ${familyName}. Toque para trocar`}
        className="min-h-[44px] max-w-[48%] flex-row items-center rounded-full bg-white px-3 py-2"
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons color={colors.mindfulBrown60} name="people" size={18} />
        <Text
          className="ml-2 shrink font-sans-semibold text-sm text-mindful-brown"
          numberOfLines={1}
        >
          {familyName}
        </Text>
        <View className="ml-1">
          <Ionicons color={colors.mindfulBrown60} name="chevron-down" size={16} />
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar menu de famílias"
          className="flex-1 justify-start bg-black/30 px-4 pt-28"
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            accessibilityLabel="Lista de famílias"
            className="rounded-2xl bg-cream p-2"
            onPress={(event) => event.stopPropagation()}
          >
            {families.map((family) => {
              const isSelected = family.id === familyId;

              return (
                <Pressable
                  key={family.id}
                  accessibilityRole="button"
                  accessibilityState={isSelected ? { selected: true } : {}}
                  className="rounded-xl px-4 py-3"
                  style={isSelected ? { backgroundColor: 'rgba(90, 104, 56, 0.12)' } : undefined}
                  onPress={() => handleSelect(family.id)}
                >
                  <Text className="font-sans-semibold text-base text-mindful-brown">{family.name}</Text>
                  <Text className="mt-0.5 font-sans text-sm text-mindful-brown/70">
                    {roleLabel(family.role)}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
