import { Routes } from '@angular/router';
import { RsvpDashboardComponent } from './rsvp-management/components/rsvp-dashboard/rsvp-dashboard.component';

export const routes: Routes = [
  {
    path: 'rsvp',
    component: RsvpDashboardComponent
  },
  {
    path: '',
    redirectTo: 'rsvp',
    pathMatch: 'full'
  }
]; 