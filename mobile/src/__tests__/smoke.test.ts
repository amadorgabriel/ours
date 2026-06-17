import { HTTP_LAYER } from '@/core/infra/http';

describe('smoke', () => {
  it('resolves path alias @/core/infra/http', () => {
    expect(HTTP_LAYER).toBe('mobile');
  });
});
