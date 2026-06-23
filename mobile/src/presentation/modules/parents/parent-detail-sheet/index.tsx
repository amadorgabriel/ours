import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ParentId } from '@/core/domain/parent';
import { useParent, useUpdateParent } from '@/core/services/usecases/parent/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

import { getParentErrorMessage } from '../parents-api-error';

type ParentDetailSheetProps = {
  parentId: ParentId | null;
  visible: boolean;
  isAdmin: boolean;
  onClose: () => void;
};

function ReadSection({
  title,
  content,
  emptyMessage,
}: {
  title: string;
  content?: string;
  emptyMessage: string;
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 font-sans-semibold text-base text-mindful-brown">{title}</Text>
      {content ? (
        <View className="rounded-xl bg-white/80 p-4">
          <Text className="font-sans text-sm text-mindful-brown">{content}</Text>
        </View>
      ) : (
        <EmptyState title={emptyMessage} variant="inline" />
      )}
    </View>
  );
}

export function ParentDetailSheet({
  parentId,
  visible,
  isAdmin,
  onClose,
}: ParentDetailSheetProps) {
  const { data: parent, isLoading, isError, isRefetching, refetch } = useParent(parentId, visible);
  const updateParent = useUpdateParent(parentId ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState('');
  const [emergencyBriefing, setEmergencyBriefing] = useState('');

  useEffect(() => {
    if (!parent) return;

    setMedicalInfo(parent.medicalInfo ?? '');
    setEmergencyBriefing(parent.emergencyBriefing ?? '');
    setIsEditing(false);
  }, [parent]);

  function handleClose() {
    updateParent.reset();
    setIsEditing(false);
    onClose();
  }

  function handleSaveMedical() {
    if (!parent) return;

    updateParent.mutate(
      {
        name: parent.name,
        relationship: parent.relationship,
        birthDate: parent.birthDate,
        medicalInfo: medicalInfo.trim() || undefined,
        emergencyBriefing: emergencyBriefing.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }

  if (!parentId) {
    return null;
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Ficha do assistido" scrollable>
      {isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={colors.serenityGreen60} />
        </View>
      ) : isError || !parent ? (
        <QueryErrorState
          message="Não foi possível carregar a ficha do assistido."
          variant="inline"
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              tintColor={colors.serenityGreen60}
              onRefresh={() => {
                void refetch();
              }}
            />
          }
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="font-sans-semibold text-xl text-mindful-brown">{parent.name}</Text>
              <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
                {parent.relationship}
              </Text>
            </View>
            {isAdmin ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isEditing ? 'Cancelar edição' : 'Editar ficha'}
                className="rounded-lg px-3 py-2"
                onPress={() => {
                  if (isEditing) {
                    setMedicalInfo(parent.medicalInfo ?? '');
                    setEmergencyBriefing(parent.emergencyBriefing ?? '');
                  }
                  setIsEditing((value) => !value);
                }}
              >
                <Text className="font-sans-semibold text-sm text-serenity-green">
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {isEditing ? (
            <>
              <View className="mt-4">
                <Text className="font-sans-semibold text-base text-mindful-brown">
                  Informações médicas
                </Text>
                <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
                  Alergias, medicamentos e observações relevantes.
                </Text>
                <TextInput
                  accessibilityLabel="Informações médicas"
                  className="mt-2 min-h-[120px] rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
                  multiline
                  placeholder="Ex.: alergia a penicilina; toma losartana 50mg"
                  placeholderTextColor={colors.mindfulBrown60}
                  textAlignVertical="top"
                  value={medicalInfo}
                  onChangeText={setMedicalInfo}
                />
              </View>

              <View className="mt-4">
                <Text className="font-sans-semibold text-base text-mindful-brown">
                  Briefing de emergência
                </Text>
                <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
                  Contatos, endereço e instruções para situações urgentes.
                </Text>
                <TextInput
                  accessibilityLabel="Briefing de emergência"
                  className="mt-2 min-h-[120px] rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
                  multiline
                  placeholder="Ex.: ligar para Maria (11) 99999-9999"
                  placeholderTextColor={colors.mindfulBrown60}
                  textAlignVertical="top"
                  value={emergencyBriefing}
                  onChangeText={setEmergencyBriefing}
                />
              </View>

              {updateParent.isError ? (
                <Text className="mt-2 font-sans text-sm text-red-600">
                  {getParentErrorMessage(updateParent.error, 'update')}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Salvar ficha"
                className="mt-4 items-center rounded-xl bg-serenity-green py-3"
                disabled={updateParent.isPending}
                onPress={handleSaveMedical}
              >
                {updateParent.isPending ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text className="font-sans-semibold text-light">Salvar</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <ReadSection
                title="Informações médicas"
                content={parent.medicalInfo}
                emptyMessage="Nenhuma informação médica cadastrada ainda."
              />
              <ReadSection
                title="Briefing de emergência"
                content={parent.emergencyBriefing}
                emptyMessage="Nenhum briefing de emergência cadastrado ainda."
              />
            </>
          )}
        </ScrollView>
      )}
    </BottomSheet>
  );
}
