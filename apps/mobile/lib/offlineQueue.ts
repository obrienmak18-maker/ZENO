import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

const KEY = 'classe-mobile-offline-queue';
export type QueueItem = { id: string; callable: string; payload: Record<string, unknown>; createdAt: string };

async function readQueue(): Promise<QueueItem[]> {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]') as QueueItem[]; } catch { return []; }
}

export async function enqueue(callable: string, payload: Record<string, unknown>) {
  const current = await readQueue();
  const fingerprint = JSON.stringify([callable, payload]);
  if (current.some((item) => JSON.stringify([item.callable, item.payload]) === fingerprint)) return;
  current.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, callable, payload, createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(KEY, JSON.stringify(current));
}

export { readQueue };

export async function flushQueue(call: (callable: string, payload: Record<string, unknown>) => Promise<unknown>) {
  const current = await readQueue();
  const remaining: QueueItem[] = [];
  for (const item of current) { try { await call(item.callable, item.payload); } catch { remaining.push(item); } }
  await AsyncStorage.setItem(KEY, JSON.stringify(remaining));
  return { sent: current.length - remaining.length, pending: remaining.length };
}

export function installQueueReplay(call: (callable: string, payload: Record<string, unknown>) => Promise<unknown>) {
  let running = false;
  const run = async () => { if (running) return; running = true; try { await flushQueue(call); } finally { running = false; } };
  void run();
  const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void run(); });
  const onlineHandler = () => { void run(); };
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.addEventListener('online', onlineHandler);
  return () => { subscription.remove(); if (Platform.OS === 'web' && typeof window !== 'undefined') window.removeEventListener('online', onlineHandler); };
}
