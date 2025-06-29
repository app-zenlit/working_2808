// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'ZenlitOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // Create object stores
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('shared')) {
          db.createObjectStore('shared', { keyPath: 'id' });
        }
      };
    });
  }

  async store(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async remove(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const offlineStorage = new OfflineStorage();

// Offline queue management
export class OfflineQueue {
  private storage = offlineStorage;

  async addPost(post: any): Promise<void> {
    const offlinePost = {
      ...post,
      id: `offline_${Date.now()}`,
      offline: true,
      timestamp: new Date().toISOString()
    };

    await this.storage.store('posts', offlinePost);
    
    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync-posts');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  async addMessage(message: any): Promise<void> {
    const offlineMessage = {
      ...message,
      id: `offline_${Date.now()}`,
      offline: true,
      timestamp: new Date().toISOString()
    };

    await this.storage.store('messages', offlineMessage);
    
    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync-messages');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  async getOfflinePosts(): Promise<any[]> {
    return await this.storage.getAll('posts');
  }

  async getOfflineMessages(): Promise<any[]> {
    return await this.storage.getAll('messages');
  }

  async removePost(id: string): Promise<void> {
    await this.storage.remove('posts', id);
  }

  async removeMessage(id: string): Promise<void> {
    await this.storage.remove('messages', id);
  }
}

export const offlineQueue = new OfflineQueue();

// Shared content handling (for Web Share Target API)
export async function getSharedContent(): Promise<any> {
  try {
    const shared = await offlineStorage.get('shared', 'latest');
    if (shared && shared.data) {
      // Clear after reading
      await offlineStorage.remove('shared', 'latest');
      return shared.data;
    }
  } catch (error) {
    console.error('Error getting shared content:', error);
  }
  return null;
}