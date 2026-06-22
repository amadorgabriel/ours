import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistidoSheet } from '@/presentation/modules/assistido';
import { FamilyDropdown } from '@/presentation/modules/app-shell/FamilyDropdown';
import { useAssistido } from '@/presentation/providers/assistido';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';

const HEADER_HEIGHT = 56;

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { familyId, setFamilyId } = useFamily();
  const { activeParent } = useAssistido();
  const [assistidoSheetVisible, setAssistidoSheetVisible] = useState(false);

  const families = session?.families ?? [];
  const activeFamily = families.find((family) => family.id === familyId);
  const familyName = activeFamily?.name ?? 'Família';
  const assistidoLabel = activeParent?.name ?? 'Assistido';
  const assistidoInitial = assistidoLabel.charAt(0).toUpperCase();

  function handleAssistidoPress() {
    setAssistidoSheetVisible(true);
  }

  return (
    <>
      <View
        className="border-b border-mindful-brown/10 bg-cream px-4"
        style={{ paddingTop: insets.top, height: HEADER_HEIGHT + insets.top }}
      >
        <View className="h-14 flex-row items-center justify-between gap-2">
          <FamilyDropdown
            families={families}
            familyId={familyId}
            familyName={familyName}
            onSelectFamily={setFamilyId}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Assistido: ${assistidoLabel}. Toque para selecionar`}
            className="min-h-[44px] max-w-[48%] flex-row items-center rounded-full bg-white px-3 py-2"
            onPress={handleAssistidoPress}
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-mindful-brown/15">
              <Text className="font-sans-semibold text-xs text-mindful-brown">{assistidoInitial}</Text>
            </View>
            <Text
              className="ml-2 shrink font-sans-semibold text-sm text-mindful-brown"
              numberOfLines={1}
            >
              {assistidoLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <AssistidoSheet
        visible={assistidoSheetVisible}
        onClose={() => setAssistidoSheetVisible(false)}
      />
    </>
  );
}
