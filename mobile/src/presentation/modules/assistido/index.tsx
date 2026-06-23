import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/presentation/providers/auth';
import { useAssistido } from '@/presentation/providers/assistido';
import { useFamily } from '@/presentation/providers/family';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

type AssistidoSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function ParentListItem({
  parent,
  isSelected,
  onSelect,
}: {
  parent: { id: string; name: string; relationship: string };
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
  const router = useRouter();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const { parents, parentId, isLoading, setParentId } = useAssistido();

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const isAdmin = activeFamily?.role === 'Admin';

  function handleSelect(id: string) {
    setParentId(id);
    onClose();
  }

  function handleAdminCreate() {
    onClose();
    router.push('/(app)/(tabs)/profile' as Href);
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Selecionar assistido">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Assistido</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">
        Escolha para quem você está cuidando agora.
      </Text>

      {!isLoading ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Todos os assistidos"
          accessibilityState={{ selected: parentId === null }}
          className={`mt-4 flex-row items-center rounded-xl px-4 py-3 ${
            parentId === null ? 'bg-serenity-green/15' : 'bg-white'
          }`}
          onPress={() => {
            setParentId(null);
            onClose();
          }}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
            <Text className="font-sans-semibold text-mindful-brown">∞</Text>
          </View>
          <View className="flex-1">
            <Text className="font-sans-semibold text-mindful-brown">Todos os assistidos</Text>
            <Text className="font-sans text-sm text-mindful-brown/70">Sem filtro no feed e calendário</Text>
          </View>
        </Pressable>
      ) : null}

      {isLoading && (
        <Text className="mt-6 font-sans text-sm text-mindful-brown/70">Carregando...</Text>
      )}

      {!isLoading && parents.length === 0 ? (
        <View className="mt-6">
          <EmptyState
            title="Nenhum assistido cadastrado"
            description={
              isAdmin
                ? 'Cadastre Pai, Mãe ou outro assistido para personalizar ligações e atividades.'
                : 'Peça ao administrador da família para cadastrar os assistidos.'
            }
            actionLabel={isAdmin ? 'Cadastrar assistido' : undefined}
            onAction={isAdmin ? handleAdminCreate : undefined}
            variant="inline"
          />
        </View>
      ) : null}

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
