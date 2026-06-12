import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const REACTION_EMOJI: Record<string, string> = {
  heart: '♥',
  clap: '👏',
  laugh: '😂',
  sob: '🥺',
  wow: '😮',
  fire: '🔥',
};

export function reactionEmoji(type: string): string {
  return REACTION_EMOJI[type] ?? '❓';
}

export function formatEventTime(startAt: string, endAt: string, isAllDay: boolean): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateStr = `${start.getMonth() + 1}월 ${start.getDate()}일`;
  if (isAllDay) return `${dateStr} · 종일`;
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${dateStr} ${fmt(start)}~${fmt(end)}`;
}
