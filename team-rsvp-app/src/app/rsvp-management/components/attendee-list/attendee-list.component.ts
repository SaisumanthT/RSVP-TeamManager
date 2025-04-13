import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { RsvpEntry, RsvpStatus } from '../../models/rsvp.model';
import { RsvpService } from '../../services/rsvp.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-attendee-list',
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AttendeeListComponent implements OnInit {
  // All RSVP entries
  allRsvps$!: Observable<RsvpEntry[]>;
  
  // Available statuses for dropdown
  rsvpStatuses: RsvpStatus[] = ['Yes', 'No', 'Maybe'];
  
  // Track which player is being edited
  editingPlayerId: string | null = null;
  
  // Form for editing RSVPs
  rsvpEditForm!: FormGroup;
  
  constructor(
    private rsvpService: RsvpService,
    private logger: LoggerService,
    private formBuilder: FormBuilder
  ) {}
  
  ngOnInit(): void {
    // Get all RSVPs, not just confirmed attendees
    this.allRsvps$ = this.rsvpService.getAllRsvpEntries();
    
    // Initialize the edit form
    this.initializeForm();
  }
  
  //Initialize the edit form
  private initializeForm(): void {
    this.rsvpEditForm = this.formBuilder.group({
      status: ['Yes', Validators.required],
      guestCount: [0, [Validators.min(0), Validators.max(10)]],
      notes: ['']
    });
  }
  
  // Editing a player's RSVP
  startEdit(rsvp: RsvpEntry): void {
    this.editingPlayerId = rsvp.player.id;
    this.rsvpEditForm.patchValue({
      status: rsvp.status,
      guestCount: rsvp.guestCount || 0,
      notes: rsvp.notes || ''
    });
  }
  
  //Cancel editing
  cancelEdit(): void {
    this.editingPlayerId = null;
  }
  
  //Save changes to a player's RSVP
  saveRsvp(rsvp: RsvpEntry): void {
    if (this.rsvpEditForm.invalid) {
      this.logger.warn('Edit form validation failed');
      return;
    }
    
    const formValues = this.rsvpEditForm.value;
    const status = formValues.status as RsvpStatus;
    const guestCount = status === 'Yes' ? formValues.guestCount : 0;
    
    this.rsvpService.addOrUpdateRsvp(rsvp.player, status, formValues.notes, guestCount);
    this.editingPlayerId = null;
    
    this.logger.info(`Updated RSVP for ${rsvp.player.name}`);
  }
  
  //CSS class based on RSVP status
  getStatusClass(status: RsvpStatus): string {
    switch (status) {
      case 'Yes': return 'status-confirmed';
      case 'No': return 'status-declined';
      case 'Maybe': return 'status-maybe';
      default: return '';
    }
  }
} 