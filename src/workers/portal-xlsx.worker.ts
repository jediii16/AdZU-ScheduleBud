/// <reference lib="webworker" />

import { parsePortalWorkbook } from "@/domain/import";

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<{ bytes: ArrayBuffer }>) => {
  let sequence = 0;
  try {
    const result = parsePortalWorkbook(event.data.bytes, {
      idFactory: (kind) => `import-${kind}-${sequence++}`,
    });
    self.postMessage({ ok: true, result });
  } catch (error) {
    self.postMessage({
      ok: false,
      message:
        error instanceof Error ? error.message : "Unknown workbook error",
    });
  }
};

export {};
