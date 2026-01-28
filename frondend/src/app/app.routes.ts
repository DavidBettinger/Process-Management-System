import { Routes } from '@angular/router';
import { CaseDetailComponent } from './features/cases/case-detail/case-detail.component';
import { CaseMeetingsComponent } from './features/cases/case-meetings/case-meetings.component';
import { CaseTasksComponent } from './features/cases/case-tasks/case-tasks.component';
import { CaseTimelineComponent } from './features/cases/case-timeline/case-timeline.component';
import { CasesPageComponent } from './features/cases/cases-page/cases-page.component';
import { MeetingsPageComponent } from './features/meetings/meetings-page/meetings-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cases' },
  { path: 'cases', component: CasesPageComponent },
  {
    path: 'cases/:caseId',
    component: CaseDetailComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'timeline' },
      { path: 'timeline', component: CaseTimelineComponent },
      { path: 'tasks', component: CaseTasksComponent },
      { path: 'meetings', component: CaseMeetingsComponent }
    ]
  },
  { path: 'meetings', component: MeetingsPageComponent },
  { path: '**', redirectTo: 'cases' }
];
