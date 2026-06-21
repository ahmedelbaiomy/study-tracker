import { Component } from '@angular/core';
import { StudyTracker } from './study-tracker/study-tracker';

@Component({
  selector: 'app-root',
  imports: [StudyTracker],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
