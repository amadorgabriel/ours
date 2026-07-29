import {
  registerCreateParentHandler,
  requestCreateParentSheet,
} from '../create-parent-intent';

describe('create-parent-intent', () => {
  afterEach(() => {
    registerCreateParentHandler(() => {})();
  });

  it('opens sheet immediately when handler is registered', async () => {
    const openSheet = jest.fn();
    registerCreateParentHandler(openSheet);

    requestCreateParentSheet();
    await Promise.resolve();

    expect(openSheet).toHaveBeenCalledTimes(1);
  });

  it('opens sheet when request happens before handler registration', async () => {
    const openSheet = jest.fn();

    requestCreateParentSheet();
    registerCreateParentHandler(openSheet);
    await Promise.resolve();

    expect(openSheet).toHaveBeenCalledTimes(1);
  });
});
