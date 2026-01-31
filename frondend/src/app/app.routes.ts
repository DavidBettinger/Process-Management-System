import { Routes } from '@angular/router';
import { CaseDetailPageComponent } from './features/case-detail/pages/case-detail/case-detail.page';
import { TasksTabPageComponent } from './features/tasks/pages/tasks-tab/tasks-tab.page';
import { CaseListPageComponent } from './features/cases/pages/case-list/case-list.page';
import { MeetingsPageComponent } from './features/meetings/meetings-page/meetings-page.component';
import { MeetingsTabPageComponent } from './features/meetings/pages/meetings-tab/meetings-tab.page';
import { LocationsPageComponent } from './features/locations/pages/locations-page/locations-page.page';
import { KitasPageComponent } from './features/kitas/pages/kitas-page/kitas-page.page';
import { StakeholdersPageComponent } from './features/stakeholders/pages/stakeholders-page/stakeholders-page.page';
import { StakeholderDetailPageComponent } from './features/stakeholders/pages/stakeholder-detail-page/stakeholder-detail-page.page';
import { TimelineTabPageComponent } from './features/timeline/pages/timeline-tab/timeline-tab.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cases' },
  { path: 'cases', component: CaseListPageComponent },
  { path: 'locations', component: LocationsPageComponent },
  { path: 'kitas', component: KitasPageComponent },
  { path: 'stakeholders/:stakeholderId', component: StakeholderDetailPageComponent },
  { path: 'stakeholders', component: StakeholdersPageComponent },
  {
    path: 'cases/:caseId',
    component: CaseDetailPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'timeline' },
      { path: 'timeline', component: TimelineTabPageComponent },
      { path: 'tasks', component: TasksTabPageComponent },
      { path: 'meetings', component: MeetingsTabPageComponent }
    ]
  },
  { path: 'meetings', component: MeetingsPageComponent },
  { path: '**', redirectTo: 'cases' }
];
