import { useEffect, useState } from 'react';

import { registerCreateParentHandler } from '@/core/infra/navigation/create-parent-intent';

import { CreateParentSheet } from '../create-parent-sheet';

export function CreateParentHost() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return registerCreateParentHandler(() => setVisible(true));
  }, []);

  return <CreateParentSheet visible={visible} onClose={() => setVisible(false)} />;
}
