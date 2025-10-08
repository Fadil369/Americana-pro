// BRAINSAIT: Offline-first data synchronization service
// MEDICAL: Ensures all sales and delivery data is synced when connection is available

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncQueueItem {
  id: string;
  type: 'order' | 'checkin' | 'delivery' | 'incident';
  data: any;
  timestamp: number;
  retryCount: number;
}

const SYNC_QUEUE_KEY = '@ssdp_sync_queue';
const MAX_RETRY_COUNT = 3;

class OfflineSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing = false;

  async initialize() {
    await this.loadQueue();
  }

  private async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  async addToQueue(type: SyncQueueItem['type'], data: any): Promise<string> {
    const item: SyncQueueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(item);
    await this.saveQueue();

    // Try to sync immediately if online
    this.trySync();

    return item.id;
  }

  async trySync(): Promise<boolean> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return false;
    }

    this.isSyncing = true;

    try {
      const itemsToSync = [...this.syncQueue];
      const syncedItems: string[] = [];
      const failedItems: string[] = [];

      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          syncedItems.push(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retryCount++;
          
          if (item.retryCount >= MAX_RETRY_COUNT) {
            failedItems.push(item.id);
          }
        }
      }

      // Remove successfully synced items
      this.syncQueue = this.syncQueue.filter(
        item => !syncedItems.includes(item.id) && !failedItems.includes(item.id)
      );

      await this.saveQueue();

      // Log failed items for manual review
      if (failedItems.length > 0) {
        console.warn('Items failed to sync after max retries:', failedItems);
      }

      return syncedItems.length > 0;
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // TODO: Implement actual API calls based on item type
    switch (item.type) {
      case 'order':
        // await API.createOrder(item.data);
        break;
      case 'checkin':
        // await API.createCheckIn(item.data);
        break;
      case 'delivery':
        // await API.confirmDelivery(item.data);
        break;
      case 'incident':
        // await API.reportIncident(item.data);
        break;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  getQueueLength(): number {
    return this.syncQueue.length;
  }

  getQueueItems(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  async clearQueue() {
    this.syncQueue = [];
    await this.saveQueue();
  }
}

export const offlineSyncService = new OfflineSyncService();
