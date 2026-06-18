import { Pressable, Text, View } from 'react-native';

import type { ParentSummary } from '@/core/domain/parent';
import { useAssistido } from '@/presentation/providers/assistido';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type AssistidoSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function ParentListItem({
  parent,
  isSelected,
  onSelect,
}: {
  parent: ParentSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Selecionar ${parent.name}`}
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
        <Text className="font-sans text-sm text-mindful-brown/70">{parent.relationship}</Text>
      </View>
    </Pressable>
  );
}

export function AssistidoSheet({ visible, onClose }: AssistidoSheetProps) {
  const { parents, parentId, isLoading, setParentId } = useAssistido();

  function handleSelect(id: string) {
    setParentId(id);
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Selecionar assistido">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Assistido</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Escolha para quem você está cuidando agora.
      </Text>

      {isLoading && (
        <Text className="mt-6 font-sans text-sm text-mindful-brown/70">Carregando...</Text>
      )}

      {!isLoading && parents.length === 0 && (
        <View className="mt-6 rounded-xl bg-white p-4">
          <Text className="font-sans-semibold text-mindful-brown">Nenhum assistido cadastrado</Text>
          <Text className="mt-2 font-sans text-sm text-mindful-brown/70">
            Os dados dos pais serão cadastrados em breve. Quando estiverem disponíveis, você poderá
            selecioná-los aqui.
          </Text>
        </View>
      )}

      {!isLoading &&
        parents.map((parent) => (
          <ParentListItem
            key={parent.id}
            parent={parent}
            isSelected={parent.id === parentId}
            onSelect={() => handleSelect(parent.id)}
          />
        ))}
    </BottomSheet>
  );
}
