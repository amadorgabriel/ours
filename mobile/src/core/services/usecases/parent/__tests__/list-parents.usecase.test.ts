import { ListParentsUseCase } from '../list-parents.usecase';

describe('ListParentsUseCase', () => {
  it('returns empty list until parents API exists (M-FAM-05 prep)', async () => {
    const useCase = new ListParentsUseCase();
    await expect(useCase.listMine()).resolves.toEqual([]);
  });
});
