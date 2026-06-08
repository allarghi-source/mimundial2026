export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.requestPermission()
}

export async function scheduleMatchReminder(_matchId: string, _minutesBefore: number): Promise<void> {
  // stub — local notification scheduling not yet implemented
}

export async function cancelMatchReminder(_matchId: string): Promise<void> {
  // stub
}

export function isSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}
