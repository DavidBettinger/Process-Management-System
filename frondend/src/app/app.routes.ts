import { Routes } from '@angular/router';
import { CaseDetailPageComponent } from './features/case-detail/pages/case-detail/case-detail.page';
import { TasksTabPageComponent } from './features/tasks/pages/tasks-tab/tasks-tab.page';
import { CaseTimelineComponent } from './features/cases/case-timeline/case-timeline.component';
import { CaseListPageComponent } from './features/cases/pages/case-list/case-list.page';
import { MeetingsPageComponent } from './features/meetings/meetings-page/meetings-page.component';
import { MeetingsTabPageComponent } from './features/meetings/pages/meetings-tab/meetings-tab.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cases' },
  { path: 'cases', component: CaseListPageComponent },
  {
    path: 'cases/:caseId',
    component: CaseDetailPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'timeline' },
      { path: 'timeline', component: CaseTimelineComponent },
      { path: 'tasks', component: TasksTabPageComponent },
      { path: 'meetings', component: MeetingsTabPageComponent }
    ]
  },
  { path: 'meetings', component: MeetingsPageComponent },
  { path: '**', redirectTo: 'cases' }
];
