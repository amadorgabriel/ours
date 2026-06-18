import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistidoSheet } from '@/presentation/modules/assistido';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { useAssistido } from '@/presentation/providers/assistido';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';

const HEADER_HEIGHT = 56;

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const { activeParent } = useAssistido();
  const [assistidoSheetVisible, setAssistidoSheetVisible] = useState(false);

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const familyName = activeFamily?.name ?? 'Família';
  const assistidoLabel = activeParent?.name ?? 'Assistido';
  const assistidoInitial = assistidoLabel.charAt(0).toUpperCase();

  function handleFamilyPress() {
    router.push(mobileRoutes.familiesSelect as Href);
  }

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Família ativa: ${familyName}. Toque para trocar`}
            className="min-h-[44px] max-w-[48%] flex-row items-center rounded-full bg-white px-3 py-2"
            onPress={handleFamilyPress}
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
