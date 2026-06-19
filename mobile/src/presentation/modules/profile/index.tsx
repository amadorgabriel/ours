import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { FamilyWithRoleModel } from '@/core/domain/family';
import type { ParentSummary } from '@/core/domain/parent';
import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import { useParents } from '@/core/services/usecases/parent/index.hooks';
import { InviteSheet } from '@/presentation/modules/family/invite';
import { CreateParentSheet } from '@/presentation/modules/parents/create-parent-sheet';
import { EditParentSheet } from '@/presentation/modules/parents/edit-parent-sheet';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';

function roleLabel(role: FamilyWithRoleModel['role']): string {
  return role === 'Admin' ? 'Administrador' : 'Membro';
}

function ParentListItem({
  parent,
  onEdit,
}: {
  parent: ParentSummary;
  onEdit: () => void;
}) {
  return (
    <View className="mb-2 flex-row items-center rounded-xl bg-cream px-3 py-3">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
        <Text className="font-sans-semibold text-mindful-brown">
          {parent.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-mindful-brown">{parent.name}</Text>
        <Text className="font-sans text-sm text-mindful-brown/70">{parent.relationship}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Editar ${parent.name}`}
        className="rounded-lg px-3 py-2"
        onPress={onEdit}
      >
        <Text className="font-sans-semibold text-sm text-serenity-green">Editar</Text>
      </Pressable>
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const logoutMutation = useLogout();
  const { data: parents = [], isLoading: parentsLoading } = useParents(familyId);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [createParentVisible, setCreateParentVisible] = useState(false);
  const [editParent, setEditParent] = useState<ParentSummary | null>(null);

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const isAdmin = activeFamily?.role === 'Admin';
  const userInitial = (session?.user.name ?? '?').charAt(0).toUpperCase();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace(mobileRoutes.login as Href),
    });
  }

  return (
    <>
      <ScrollView className="flex-1 bg-cream" contentContainerClassName="grow px-6 py-8">
        <Text className="font-sans-semibold text-2xl text-mindful-brown">Perfil</Text>

        <View className="mt-8 rounded-2xl bg-white p-5">
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-mindful-brown/15">
              <Text className="font-sans-semibold text-xl text-mindful-brown">{userInitial}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-sans-semibold text-lg text-mindful-brown">
                {session?.user.name ?? 'Usuário'}
              </Text>
              <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
                {session?.user.email ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white p-5">
          <Text className="font-sans text-sm text-mindful-brown/70">Família ativa</Text>
          <Text className="mt-1 font-sans-semibold text-lg text-mindful-brown">
            {activeFamily?.name ?? '—'}
          </Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
            {activeFamily ? roleLabel(activeFamily.role) : '—'}
          </Text>
        </View>

        {isAdmin && (
          <>
            <View className="mt-4 rounded-2xl bg-white p-5">
              <Text className="font-sans-semibold text-lg text-mindful-brown">Assistidos</Text>
              <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
                Pais ou pessoas que a família cuida.
              </Text>

              {parentsLoading ? (
                <Text className="mt-4 font-sans text-sm text-mindful-brown/70">Carregando...</Text>
              ) : null}

              {!parentsLoading && parents.length === 0 ? (
                <Text className="mt-4 font-sans text-sm text-mindful-brown/70">
                  Nenhum assistido cadastrado ainda.
                </Text>
              ) : null}

              {!parentsLoading
                ? parents.map((parent) => (
                    <ParentListItem
                      key={parent.id}
                      parent={parent}
                      onEdit={() => setEditParent(parent)}
                    />
                  ))
                : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Novo assistido"
                className="mt-4 items-center rounded-xl border border-serenity-green py-3"
                onPress={() => setCreateParentVisible(true)}
              >
                <Text className="font-sans-semibold text-serenity-green">Novo assistido</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Convidar familiar"
              className="mt-4 items-center rounded-xl bg-serenity-green py-3"
              onPress={() => setInviteVisible(true)}
            >
              <Text className="font-sans-semibold text-light">Convidar familiar</Text>
            </Pressable>
          </>
        )}

        <View className="mt-auto pt-8">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            className="items-center rounded-xl border border-mindful-brown/20 py-3"
            disabled={logoutMutation.isPending}
            onPress={handleLogout}
          >
            <Text className="font-sans-semibold text-mindful-brown">
              {logoutMutation.isPending ? 'Saindo…' : 'Sair'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <InviteSheet visible={inviteVisible} onClose={() => setInviteVisible(false)} />
      <CreateParentSheet
        visible={createParentVisible}
        onClose={() => setCreateParentVisible(false)}
      />
      <EditParentSheet
        parent={editParent}
        visible={editParent !== null}
        onClose={() => setEditParent(null)}
      />
    </>
  );
}
