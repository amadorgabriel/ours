import { HttpClientFactory } from '@/core/infra/http';

describe('smoke', () => {
  it('resolves path alias @/core/infra/http', () => {
    expect(HttpClientFactory.create()).toBeDefined();
  });
});
