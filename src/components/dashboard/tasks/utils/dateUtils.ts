export function isoToTimestamp(iso: string): number {
  return new Date(iso).getTime();
}

export function timestampToISO(ts: number): string {
  const date = new Date(ts);
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0') + 'T' + 
    String(date.getHours()).padStart(2, '0') + ':' + 
    String(date.getMinutes()).padStart(2, '0');
}

export function getWeekOfMonth(date: Date): string {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return `${weekNumber}${getOrdinalSuffix(weekNumber)} week of ${
    monthNames[date.getMonth()]
  }`;
}

export function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export function getUgandaDateTime() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const ugandaTime = utcTime + (3 * 60 * 60 * 1000); // UTC+3
  const ugandaNow = new Date(ugandaTime);
  
  const nowISO = ugandaNow.getFullYear() + '-' + 
    String(ugandaNow.getMonth() + 1).padStart(2, '0') + '-' + 
    String(ugandaNow.getDate()).padStart(2, '0') + 'T08:00';
  
  const endISO = ugandaNow.getFullYear() + '-' + 
    String(ugandaNow.getMonth() + 1).padStart(2, '0') + '-' + 
    String(ugandaNow.getDate()).padStart(2, '0') + 'T23:59';
  
  const todayISO = ugandaNow.toISOString().slice(0, 10);

  return { nowISO, endISO, todayISO };
}