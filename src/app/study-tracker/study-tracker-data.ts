import { Injectable, signal } from '@angular/core';

export interface Session {
  pill: string;
  label: string;
  time: string;
}

export interface DailyFixedItem {
  pill: string;
  label: string;
  name: string;
  time: string;
}

export interface DayViewModel {
  dayIndex: number;
  dayName: string;
  date: Date;
  dateLabel: string;
  sessions: Session[];
  done: boolean;
  isToday: boolean;
  locked: boolean;
}

export interface Stats {
  weekDone: number;
  total: number;
  streak: number;
}

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const SESSIONS: Session[][] = [
  [{ pill: 'pill-coral', label: 'NestJS', time: '90 د' }, { pill: 'pill-blue', label: 'System Design', time: '60 د' }],
  [{ pill: 'pill-purple', label: 'NgRx', time: '90 د' }, { pill: 'pill-green', label: 'Performance', time: '60 د' }],
  [{ pill: 'pill-coral', label: 'NestJS', time: '90 د' }, { pill: 'pill-blue', label: 'System Design', time: '60 د' }],
  [{ pill: 'pill-purple', label: 'NgRx', time: '90 د' }, { pill: 'pill-green', label: 'Performance', time: '60 د' }],
  [{ pill: 'pill-coral', label: 'NestJS', time: '90 د' }, { pill: 'pill-amber', label: 'مراجعة', time: '60 د' }],
  [{ pill: 'pill-blue', label: 'Sys Design', time: '120 د' }, { pill: 'pill-coral', label: 'NestJS تطبيق', time: '90 د' }],
  [{ pill: 'pill-purple', label: 'NgRx تطبيق', time: '120 د' }, { pill: 'pill-green', label: 'Performance', time: '90 د' }],
];

const DAILY_FIXED: DailyFixedItem[] = [
  { pill: 'pill-blue', label: 'English', name: '6 min BBC + إبراهيم عادل', time: '45 د' },
  { pill: 'pill-purple', label: 'DSA', name: 'مسألة أو اتنين LeetCode', time: '45 د' },
  { pill: 'pill-teal', label: 'German', name: 'DW course — خفيف', time: '15 د' },
];

const START_DATE = new Date(2026, 5, 7);
const STORAGE_PREFIX = 'study_w';

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

@Injectable({ providedIn: 'root' })
export class StudyTrackerData {
  readonly days = DAYS;
  readonly dailyFixed = DAILY_FIXED;
  readonly currentWeek = signal(this.getCurrentWeek());
  /** bumped on every mutation so computed signals reading localStorage know to recompute */
  readonly tick = signal(0);

  getCurrentWeek(): number {
    const today = startOfDay(new Date());
    const start = startOfDay(START_DATE);
    const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
    return Math.max(0, Math.floor(diffDays / 7));
  }

  getWeekStart(week: number): Date {
    const d = new Date(START_DATE);
    d.setDate(d.getDate() + week * 7);
    return d;
  }

  getDayDate(week: number, dayIndex: number): Date {
    const d = new Date(this.getWeekStart(week));
    d.setDate(d.getDate() + dayIndex);
    return d;
  }

  isToday(d: Date): boolean {
    return startOfDay(d).getTime() === startOfDay(new Date()).getTime();
  }

  isFuture(d: Date): boolean {
    return startOfDay(d).getTime() > startOfDay(new Date()).getTime();
  }

  isPast(d: Date): boolean {
    return startOfDay(d).getTime() < startOfDay(new Date()).getTime();
  }

  private getKey(week: number, dayIndex: number): string {
    return `${STORAGE_PREFIX}${week}_d${dayIndex}`;
  }

  private loadDone(week: number, dayIndex: number): boolean {
    return localStorage.getItem(this.getKey(week, dayIndex)) === '1';
  }

  private saveDone(week: number, dayIndex: number, value: boolean): void {
    localStorage.setItem(this.getKey(week, dayIndex), value ? '1' : '0');
  }

  formatDate(d: Date): string {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  changeWeek(dir: number): void {
    this.currentWeek.update((w) => Math.max(0, w + dir));
  }

  toggle(dayIndex: number): void {
    const week = this.currentWeek();
    const date = this.getDayDate(week, dayIndex);
    if (!this.isToday(date)) return;
    this.saveDone(week, dayIndex, !this.loadDone(week, dayIndex));
    this.tick.update((v) => v + 1);
  }

  resetAll(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    this.currentWeek.set(0);
    this.tick.update((v) => v + 1);
  }

  getWeekDays(week: number): DayViewModel[] {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = this.getDayDate(week, dayIndex);
      const isToday = this.isToday(date);
      const isFuture = this.isFuture(date);
      const isPast = this.isPast(date);
      return {
        dayIndex,
        dayName: DAYS[dayIndex],
        date,
        dateLabel: this.formatDate(date),
        sessions: SESSIONS[dayIndex],
        done: this.loadDone(week, dayIndex),
        isToday,
        locked: isFuture || isPast,
      };
    });
  }

  calcStats(currentWeek: number): { total: number; streak: number } {
    const today = startOfDay(new Date());
    const allDays: { week: number; dayIndex: number; done: boolean }[] = [];

    for (let w = 0; w <= currentWeek + 8; w++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = startOfDay(this.getDayDate(w, dayIndex));
        if (date > today) break;
        allDays.push({ week: w, dayIndex, done: this.loadDone(w, dayIndex) });
      }
    }

    let total = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    for (const day of allDays) {
      if (day.done) {
        total++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return { total, streak: maxStreak };
  }
}
