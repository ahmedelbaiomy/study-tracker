import { Component, computed, inject } from '@angular/core';
import { StudyTrackerData } from './study-tracker-data';

@Component({
  selector: 'app-study-tracker',
  imports: [],
  templateUrl: './study-tracker.html',
  styleUrl: './study-tracker.css',
})
export class StudyTracker {
  private readonly data = inject(StudyTrackerData);

  readonly dailyFixed = this.data.dailyFixed;
  readonly currentWeek = this.data.currentWeek;

  readonly weekDays = computed(() => {
    this.data.tick();
    return this.data.getWeekDays(this.currentWeek());
  });

  readonly weekLabel = computed(() => `الأسبوع ${this.currentWeek() + 1}`);

  readonly weekDone = computed(
    () => this.weekDays().filter((d) => d.done).length,
  );

  readonly stats = computed(() => {
    this.data.tick();
    return this.data.calcStats(this.currentWeek());
  });

  isPrevDisabled(): boolean {
    return this.currentWeek() === 0;
  }

  changeWeek(dir: number): void {
    this.data.changeWeek(dir);
  }

  toggle(dayIndex: number): void {
    this.data.toggle(dayIndex);
  }

  resetAll(): void {
    if (!confirm('هتمسح كل السجل؟')) return;
    this.data.resetAll();
  }
}
