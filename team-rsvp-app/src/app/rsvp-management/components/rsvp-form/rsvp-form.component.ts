import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/player.model';
import { RsvpStatus } from '../../models/rsvp.model';
import { RsvpService } from '../../services/rsvp.service';
import { LoggerService } from '../../services/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-rsvp-form',
  templateUrl: './rsvp-form.component.html',
  styleUrls: ['./rsvp-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RsvpFormComponent implements OnInit {
  rsvpForm!: FormGroup;
  submitted = false;
  success = false;
  
  // Available RSVP statuses
  rsvpStatuses: RsvpStatus[] = ['Yes', 'No', 'Maybe'];
  
  constructor(
    private formBuilder: FormBuilder,
    private rsvpService: RsvpService,
    private logger: LoggerService
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  //Initialize the RSVP form with validators
  private initializeForm(): void {
    this.rsvpForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['Yes', Validators.required],
      guestCount: [0, [Validators.min(0), Validators.max(10)]],
      notes: ['']
    });
  }
  
  //Handle form submission
  onSubmit(): void {
    this.submitted = true;
    
    if (!this.isFormValid()) {
      return;
    }

    // Check if a player with this email already exists
    const formValues = this.rsvpForm.value;
    const email = formValues.email;

    this.rsvpService.findPlayerByEmail(email).subscribe(existingPlayer => {
      if (existingPlayer) {
        // Update existing player's RSVP
        this.updateExistingPlayerRsvp(existingPlayer, formValues.status, formValues.guestCount, formValues.notes);
      } else {
        // Create new player
        this.createNewPlayerRsvp(formValues);
      }
      
      this.handleSuccessfulSubmission();
    });
  }
  
  // Reset the form after successful submission
  resetForm(): void {
    this.rsvpForm.reset({ 
      status: 'Yes',
      guestCount: 0
    });
    this.submitted = false;
    this.success = false;
  }
  
  //Show guest count field only when status is 'Yes'
  showGuestCountField(): boolean {
    return this.rsvpForm.get('status')?.value === 'Yes';
  }
  
  //Check if the form is valid
  private isFormValid(): boolean {
    if (this.rsvpForm.invalid) {
      this.logger.warn('Form validation failed');
      return false;
    }
    
    return true;
  }
  
  //Update RSVP for an existing player
  private updateExistingPlayerRsvp(player: Player, status: RsvpStatus, guestCount?: number, notes?: string): void {
    this.rsvpService.addOrUpdateRsvp(player, status, notes, guestCount);
    this.logger.info(`Updated existing player RSVP: ${player.name}`);
  }
  
  //Create a new player and RSVP
  private createNewPlayerRsvp(formValues: any): void {
    const player: Player = {
      id: uuidv4(), // Generating unique ID for new players
      name: formValues.name,
      email: formValues.email
    };
    
    const status = formValues.status as RsvpStatus;
    const guestCount = formValues.guestCount;
    
    this.rsvpService.addOrUpdateRsvp(player, status, formValues.notes, guestCount);
    this.logger.info(`Created new player RSVP: ${player.name}`);
  }
  
  //Handle post-submission UI updates
  private handleSuccessfulSubmission(): void {
    this.success = true;
    this.logger.info('RSVP submitted successfully');
  }
} 