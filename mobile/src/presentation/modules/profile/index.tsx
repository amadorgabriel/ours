import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { FamilyWithRoleModel } from '@/core/domain/family';
import type { ParentSummary } from '@/core/domain/parent';
import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import { useParents } from '@/core/services/usecases/parent/index.hooks';
import { InviteSheet } from '@/presentation/modules/family/invite';
import { NotificationSettings } from '@/presentation/modules/profile/notification-settings';
import { CreateParentSheet } from '@/presentation/modules/parents/create-parent-sheet';
import { EditParentSheet } from '@/presentation/modules/parents/edit-parent-sheet';
import { ParentDetailSheet } from '@/presentation/modules/parents/parent-detail-sheet';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

function roleLabel(role: FamilyWithRoleModel['role']): string {
  return role === 'Admin' ? 'Administrador' : 'Membro';
}

function ParentListItem({
  parent,
  onOpen,
  onEdit,
  showEdit,
}: {
  parent: ParentSummary;
  onOpen: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
}) {
  return (
    <View className="mb-2 flex-row items-center rounded-xl bg-cream px-3 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ficha de ${parent.name}`}
        className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15"
        onPress={onOpen}
      >
        <Text className="font-sans-semibold text-mindful-brown">
          {parent.name.charAt(0).toUpperCase()}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" className="flex-1" onPress={onOpen}>
        <Text className="font-sans-semibold text-mindful-brown">{parent.name}</Text>
        <Text className="font-sans text-sm text-mindful-brown/70">{parent.relationship}</Text>
      </Pressable>
      {showEdit && onEdit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${parent.name}`}
          className="rounded-lg px-3 py-2"
          onPress={onEdit}
        >
          <Text className="font-sans-semibold text-sm text-serenity-green">Editar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const logoutMutation = useLogout();
  const {
    data: parents = [],
    isLoading: parentsLoading,
    isError: parentsError,
    isRefetching: parentsRefetching,
    refetch: refetchParents,
  } = useParents(familyId);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [createParentVisible, setCreateParentVisible] = useState(false);
  const [editParent, setEditParent] = useState<ParentSummary | null>(null);
  const [detailParentId, setDetailParentId] = useState<string | null>(null);

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
      <ScrollView
        className="flex-1 bg-cream"
        contentContainerClassName="grow px-6 py-8"
        refreshControl={
          <RefreshControl
            refreshing={parentsRefetching}
            tintColor={colors.serenityGreen60}
            onRefresh={() => {
              void refetchParents();
            }}
          />
        }
      >
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

        <View className="mt-4 rounded-2xl bg-white p-5">
          <Text className="font-sans-semibold text-lg text-mindful-brown">Assistidos</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
            Pais ou pessoas que a família cuida.
          </Text>

          {parentsLoading ? (
            <View className="mt-4 items-center py-4">
              <ActivityIndicator color={colors.serenityGreen60} />
            </View>
          ) : null}

          {parentsError ? (
            <View className="mt-4">
              <QueryErrorState
                message="Não foi possível carregar os assistidos."
                variant="inline"
                onRetry={() => {
                  void refetchParents();
                }}
              />
            </View>
          ) : null}

          {!parentsLoading && !parentsError && parents.length === 0 ? (
            <View className="mt-4">
              <EmptyState
                title="Nenhum assistido cadastrado"
                description={
                  isAdmin
                    ? 'Cadastre Pai, Mãe ou outro assistido para a família.'
                    : 'Peça ao administrador para cadastrar os assistidos.'
                }
                actionLabel={isAdmin ? 'Novo assistido' : undefined}
                onAction={isAdmin ? () => setCreateParentVisible(true) : undefined}
                variant="inline"
              />
            </View>
          ) : null}

          {!parentsLoading && !parentsError
            ? parents.map((parent) => (
                <ParentListItem
                  key={parent.id}
                  parent={parent}
                  showEdit={isAdmin}
                  onOpen={() => setDetailParentId(parent.id)}
                  onEdit={() => setEditParent(parent)}
                />
              ))
            : null}

          {isAdmin && !parentsError ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Novo assistido"
              className="mt-4 items-center rounded-xl border border-serenity-green py-3"
              onPress={() => setCreateParentVisible(true)}
            >
              <Text className="font-sans-semibold text-serenity-green">Novo assistido</Text>
            </Pressable>
          ) : null}
        </View>

        <NotificationSettings />

        {isAdmin && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Convidar familiar"
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            onPress={() => setInviteVisible(true)}
          >
            <Text className="font-sans-semibold text-light">Convidar familiar</Text>
          </Pressable>
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
      <ParentDetailSheet
        parentId={detailParentId}
        visible={detailParentId !== null}
        isAdmin={isAdmin}
        onClose={() => setDetailParentId(null)}
      />
    </>
  );
}
