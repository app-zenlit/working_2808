interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

// Extend the existing ServiceWorkerRegistration interface
interface ServiceWorkerRegistration {
  readonly sync?: SyncManager;
}