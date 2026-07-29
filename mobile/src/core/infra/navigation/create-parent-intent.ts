let handler: (() => void) | null = null;
let pending = false;

function openPendingSheet() {
  if (!handler) {
    return;
  }

  pending = false;
  queueMicrotask(() => handler?.());
}

export function registerCreateParentHandler(openSheet: () => void): () => void {
  handler = openSheet;

  if (pending) {
    openPendingSheet();
  }

  return () => {
    if (handler === openSheet) {
      handler = null;
    }
  };
}

export function requestCreateParentSheet(): void {
  pending = true;

  if (handler) {
    openPendingSheet();
  }
}
