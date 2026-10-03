declare module "session-file-store" {
  import type { Store } from "express-session";

  interface FileStoreOptions {
    path?: string;
    ttl?: number;
    logFn?: (...args: unknown[]) => void;
    [key: string]: unknown;
  }

  function FileStoreFactory(session: { Store: typeof Store }): new (options?: FileStoreOptions) => Store;

  export = FileStoreFactory;
}
