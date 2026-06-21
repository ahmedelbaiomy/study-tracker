import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyTracker } from './study-tracker';

describe('StudyTracker', () => {
  let component: StudyTracker;
  let fixture: ComponentFixture<StudyTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(StudyTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
