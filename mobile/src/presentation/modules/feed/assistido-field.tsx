import type { ParentId, ParentSummary } from '@/core/domain/parent';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { AssistidoPickerField } from '@/ui/Forms/AssistidoPickerField';

import { FormHost } from './form-controls';

type AssistidoFieldProps = {
  parents: ParentSummary[];
  value: ParentId | null;
  onChange: (parentId: ParentId) => void;
  label: string;
};

export function AssistidoField({ parents, value, onChange, label }: AssistidoFieldProps) {
  const { t } = useTranslation();

  return (
    <FormHost>
      <AssistidoPickerField
        inline
        label={label}
        parents={parents}
        requiredHint={t('assistidoPicker.requiredHint')}
        value={value}
        onChange={(parentId) => {
          if (parentId) onChange(parentId);
        }}
      />
    </FormHost>
  );
}
