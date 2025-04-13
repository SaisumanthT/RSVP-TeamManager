import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RsvpFormComponent } from '../rsvp-form/rsvp-form.component';
import { RsvpStatsComponent } from '../rsvp-stats/rsvp-stats.component';
import { AttendeeListComponent } from '../attendee-list/attendee-list.component';
import { RsvpBulkUploadComponent } from '../rsvp-bulk-upload/rsvp-bulk-upload.component';

@Component({
  selector: 'app-rsvp-dashboard',
  templateUrl: './rsvp-dashboard.component.html',
  styleUrls: ['./rsvp-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RsvpFormComponent,
    RsvpStatsComponent,
    AttendeeListComponent,
    RsvpBulkUploadComponent
  ]
})
export class RsvpDashboardComponent {
  activeTab: 'single' | 'bulk' = 'bulk';
  
  setActiveTab(tab: 'single' | 'bulk') {
    this.activeTab = tab;
  }
} 