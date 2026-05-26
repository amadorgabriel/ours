'use client';

import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Avatar,
} from '@mantine/core';
import { IconUsers, IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface Family {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  memberCount?: number;
}

interface FamilyPickerProps {
  families: Family[];
  onSelect: (familyId: string) => void;
  onCreateNew?: () => void;
}

export function FamilyPicker({ families, onSelect, onCreateNew }: FamilyPickerProps) {
  const t = useTranslations('dashboard.familyPicker');

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed">{t('description')}</Text>
        </Stack>

        <Stack gap="md">
          {families.map((family) => (
            <Card
              key={family.id}
              withBorder
              shadow="sm"
              padding="md"
              radius="md"
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect(family.id)}
            >
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <Avatar color="blue" radius="md">
                    <IconUsers size={20} />
                  </Avatar>
                  <Stack gap={2}>
                    <Text fw={600}>{family.name}</Text>
                    <Text size="sm" c="dimmed">
                      {family.memberCount || 2} {t('members')}
                    </Text>
                  </Stack>
                </Group>
                <Badge color={family.role === 'Admin' ? 'blue' : 'gray'} variant="light">
                  {family.role === 'Admin' ? t('admin') : t('member')}
                </Badge>
              </Group>
            </Card>
          ))}

          <Button
            variant="light"
            leftSection={<IconPlus size={18} />}
            onClick={onCreateNew}
            fullWidth
            size="md"
          >
            {t('createNew')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}