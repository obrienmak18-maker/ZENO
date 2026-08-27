import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'classe-mobile-offline-queue';
export type QueueItem = { id: string; callable: string; payload: Record<string, unknown>; createdAt: string };

export async function enqueue(callable: string, payload: Record<string, unknown>) {
  const current = await readQueue();
  current.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, callable, payload, createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(KEY, JSON.stringify(current));
}

export async function readQueue(): Promise<QueueItem[]> {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]') as QueueItem[]; } catch { return []; }
}

export async function flushQueue(call: (callable: string, payload: Record<string, unknown>) => Promise<unknown>) {
  const current = await readQueue();
  const remaining: QueueItem[] = [];
  for (const item of current) {
    try { await call(item.callable, item.payload); } catch { remaining.push(item); }
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(remaining));
  return { sent: current.length - remaining.length, pending: remaining.length };
}
