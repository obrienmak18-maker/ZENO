import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: true }) });

export async function registerNotifications() {
  if (Platform.OS === 'web') return null;
  const current = await Notifications.getPermissionsAsync();
  const currentGranted = (current as unknown as { granted?: boolean }).granted === true;
  const permission = currentGranted ? current : await Notifications.requestPermissionsAsync();
  if ((permission as unknown as { granted?: boolean }).granted !== true) return null;
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data;
}

export async function scheduleAttendanceReminder(className: string, date = new Date()) {
  if (Platform.OS === 'web') return null;
  const secondsUntilStart = Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
  return Notifications.scheduleNotificationAsync({ content: { title: 'Appel à effectuer', body: `Il est temps de faire l’appel de ${className}.`, data: { targetView: 'appel' } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsUntilStart, repeats: false } });
}

export async function cancelReminder(identifier: string) { if (Platform.OS !== 'web') await Notifications.cancelScheduledNotificationAsync(identifier); }
