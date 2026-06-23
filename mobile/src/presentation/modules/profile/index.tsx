import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ParentSummary } from '@/core/domain/parent';
import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import {
  useFamilyMembers,
  useRemoveFamilyMember,
} from '@/core/services/usecases/family/index.hooks';
import { useParents } from '@/core/services/usecases/parent/index.hooks';
import { InviteSheet } from '@/presentation/modules/family/invite';
import { getRemoveMemberErrorMessage } from '@/presentation/modules/family/family-api-error';
import { roleLabel } from '@/presentation/modules/family/role-label';
import { CreateFamilySheet } from '@/presentation/modules/profile/create-family-sheet';
import { NotificationSettings } from '@/presentation/modules/profile/notification-settings';
import { FamilyAdminSheet } from '@/presentation/modules/profile/family-admin-sheet';
import { CreateParentSheet } from '@/presentation/modules/parents/create-parent-sheet';
import { EditParentSheet } from '@/presentation/modules/parents/edit-parent-sheet';
import { ParentDetailSheet } from '@/presentation/modules/parents/parent-detail-sheet';
import { mobileRoutes, resolvePostLoginRoute } from '@/presentation/modules/auth/auth-redirect';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

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
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
        {parent.photoData ? (
          <Image
            accessibilityLabel={`Foto de ${parent.name}`}
            className="h-10 w-10 rounded-full"
            source={{ uri: parent.photoData }}
          />
        ) : (
          <Text className="font-sans-semibold text-mindful-brown">
            {parent.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-mindful-brown">{parent.name}</Text>
        <Text className="font-sans text-sm text-mindful-brown/70">{parent.relationship}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ficha de ${parent.name}`}
        className="rounded-lg border border-mindful-brown/20 px-3 py-2"
        onPress={onOpen}
      >
        <Text className="font-sans-semibold text-sm text-mindful-brown">Ver ficha</Text>
      </Pressable>
      {showEdit && onEdit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${parent.name}`}
          className="ml-2 rounded-lg px-3 py-2"
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
  const insets = useSafeAreaInsets();
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
  const [familyAdminVisible, setFamilyAdminVisible] = useState(false);
  const [createFamilyVisible, setCreateFamilyVisible] = useState(false);
  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
    refetch: refetchMembers,
  } = useFamilyMembers();
  const removeMember = useRemoveFamilyMember();
  const members = membersData?.items ?? [];

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const isAdmin = activeFamily?.role === 'Admin';
  const userInitial = (session?.user.name ?? '?').charAt(0).toUpperCase();
  const userPicture = session?.user.picture;

  function handleFamilyDeleted() {
    const nextCount = Math.max(0, (session?.familyCount ?? 1) - 1);
    router.replace(resolvePostLoginRoute(nextCount) as Href);
  }

  function handleRemoveMember(memberUserId: string, memberName: string) {
    Alert.alert('Remover membro', `Remover ${memberName} da família?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Continuar',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Confirmar remoção',
            `${memberName} perderá acesso imediato à família. Esta ação não pode ser desfeita.`,
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Remover',
                style: 'destructive',
                onPress: () => {
                  const removedSelf = memberUserId === session?.user.id;
                  removeMember.mutate(memberUserId, {
                    onSuccess: (updatedSession) => {
                      if (removedSelf && updatedSession) {
                        router.replace(
                          resolvePostLoginRoute(updatedSession.familyCount) as Href
                        );
                      }
                    },
                    onError: (error) => {
                      Alert.alert('Erro ao remover', getRemoveMemberErrorMessage(error));
                    },
                  });
                },
              },
            ]
          );
        },
      },
    ]);
  }

  function handleLogout() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSettled: () => router.replace(mobileRoutes.login as Href),
          });
        },
      },
    ]);
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-cream"
        contentContainerClassName="grow px-6 py-8"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
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
            {userPicture ? (
              <Image
                accessibilityLabel="Foto do perfil"
                className="h-14 w-14 rounded-full"
                source={{ uri: userPicture }}
              />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-full bg-mindful-brown/15">
                <Text className="font-sans-semibold text-xl text-mindful-brown">{userInitial}</Text>
              </View>
            )}
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
          {isAdmin ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar família"
              className="mt-4 items-center rounded-xl border border-serenity-green py-3"
              onPress={() => setFamilyAdminVisible(true)}
            >
              <Text className="font-sans-semibold text-serenity-green">Editar família</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nova família"
            className="mt-3 items-center rounded-xl border border-mindful-brown/20 py-3"
            onPress={() => setCreateFamilyVisible(true)}
          >
            <Text className="font-sans-semibold text-mindful-brown">Nova família</Text>
          </Pressable>
        </View>

        {isAdmin ? (
          <View className="mt-4 rounded-2xl bg-white p-5">
            <Text className="font-sans-semibold text-lg text-mindful-brown">Membros</Text>
            <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
              Pessoas com acesso a esta família.
            </Text>
            {membersLoading ? (
              <View className="mt-4 items-center py-4">
                <ActivityIndicator color={colors.serenityGreen60} />
              </View>
            ) : null}
            {membersError ? (
              <View className="mt-4">
                <QueryErrorState
                  message="Não foi possível carregar os membros."
                  variant="inline"
                  onRetry={() => {
                    void refetchMembers();
                  }}
                />
              </View>
            ) : null}
            {!membersLoading && !membersError
              ? members.map((member) => (
              <View
                key={member.userId}
                className="mt-3 flex-row items-center justify-between border-b border-mindful-brown/10 pb-3"
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mindful-brown/15">
                  {member.picture ? (
                    <Image
                      accessibilityLabel={`Foto de ${member.name}`}
                      className="h-10 w-10 rounded-full"
                      source={{ uri: member.picture }}
                    />
                  ) : (
                    <Text className="font-sans-semibold text-mindful-brown">
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View className="flex-1 pr-3">
                  <Text className="font-sans-semibold text-mindful-brown">{member.name}</Text>
                  <Text className="font-sans text-sm text-mindful-brown/70">
                    {roleLabel(member.role)}
                    {member.email ? ` · ${member.email}` : ''}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${member.name}`}
                  className="rounded-lg px-3 py-2"
                  disabled={removeMember.isPending}
                  onPress={() => handleRemoveMember(member.userId, member.name)}
                >
                  <Text className="font-sans-semibold text-sm text-red-600">Remover</Text>
                </Pressable>
              </View>
            ))
              : null}
          </View>
        ) : null}

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
      {activeFamily ? (
        <FamilyAdminSheet
          familyName={activeFamily.name}
          visible={familyAdminVisible}
          onClose={() => setFamilyAdminVisible(false)}
          onDeleted={handleFamilyDeleted}
        />
      ) : null}
      <CreateFamilySheet
        visible={createFamilyVisible}
        onClose={() => setCreateFamilyVisible(false)}
      />
    </>
  );
}
