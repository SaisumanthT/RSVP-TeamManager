import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RsvpService } from '../../services/rsvp.service';
import { LoggerService } from '../../services/logger.service';
import { RsvpStatus } from '../../models/rsvp.model';
import { Player } from '../../models/player.model';

interface RsvpListEntry {
  name: string;
  email: string;
  status: RsvpStatus;
  guestCount: number;
  notes?: string;
  isDuplicate?: boolean;
}

@Component({
  selector: 'app-rsvp-list',
  templateUrl: './rsvp-list.component.html',
  styleUrls: ['./rsvp-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RsvpListComponent {
  entries: RsvpListEntry[] = [this.createEmptyEntry()];
  processing = false;
  submitResult: { success: boolean; message: string; processedCount?: number } | null = null;
  
  constructor(
    private rsvpService: RsvpService,
    private logger: LoggerService
  ) {}
  
  createEmptyEntry(): RsvpListEntry {
    return {
      name: '',
      email: '',
      status: '' as RsvpStatus,
      guestCount: 0,
      notes: '',
      isDuplicate: false
    };
  }
  
  addNewEntry(): void {
    // Check if current entries are valid before adding new one
    if (this.hasInvalidEntries()) {
      this.submitResult = {
        success: false,
        message: 'Please ensure all entries have unique name or email before adding more.'
      };
      return;
    }
    this.entries.push(this.createEmptyEntry());
    this.submitResult = null;
  }
  
  removeEntry(index: number): void {
    if (this.entries.length > 1) {
      this.entries.splice(index, 1);
      this.checkForDuplicates();
    }
  }
  
  clearEntries(): void {
    this.entries = [this.createEmptyEntry()];
    this.submitResult = null;
  }

  onStatusChange(entry: RsvpListEntry): void {
    // Reset guest count to 0 if status is not "Yes"
    if (entry.status !== 'Yes') {
      entry.guestCount = 0;
    }
  }

  onEntryChange(): void {
    this.checkForDuplicates();
  }

  private checkForDuplicates(): void {
    // Reset all duplicate flags
    this.entries.forEach(entry => entry.isDuplicate = false);

    // Check each entry against others
    for (let i = 0; i < this.entries.length; i++) {
      const current = this.entries[i];
      
      // Skip empty entries
      if (!current.name.trim() && !current.email.trim()) continue;

      for (let j = 0; j < this.entries.length; j++) {
        if (i === j) continue;
        const other = this.entries[j];
        
        // Skip comparison with empty entries
        if (!other.name.trim() && !other.email.trim()) continue;

        // Check if both name and email match
        if (current.name.trim().toLowerCase() === other.name.trim().toLowerCase() &&
            current.email.trim().toLowerCase() === other.email.trim().toLowerCase()) {
          current.isDuplicate = true;
          break;
        }
      }
    }
  }

  private hasInvalidEntries(): boolean {
    this.checkForDuplicates();
    return this.entries.some(entry => entry.isDuplicate);
  }
  
  submitRsvpList(): void {
    this.processing = true;
    this.submitResult = null;
    
    if (this.hasInvalidEntries()) {
      this.submitResult = {
        success: false,
        message: 'Please ensure all entries have unique name or email before submitting.'
      };
      this.processing = false;
      return;
    }

    // Filter out empty entries
    const validEntries = this.entries.filter(entry => 
      entry.name.trim() && 
      entry.email.trim() && 
      ['Yes', 'No', 'Maybe'].includes(entry.status)
    );
    
    if (validEntries.length === 0) {
      this.submitResult = {
        success: false,
        message: 'No valid entries found. Please fill in at least name, email, and status.'
      };
      this.processing = false;
      return;
    }

    try {
      // Process each entry
      validEntries.forEach(entry => {
        const player: Player = {
          id: crypto.randomUUID(),
          name: entry.name,
          email: entry.email
        };
        
        this.rsvpService.addOrUpdateRsvp(
          player,
          entry.status,
          entry.notes,
          entry.status === 'Yes' ? entry.guestCount : 0
        );
      });

      // All entries processed successfully
      this.submitResult = {
        success: true,
        message: `Successfully processed ${validEntries.length} RSVP entries.`,
        processedCount: validEntries.length
      };
      this.processing = false;
      // Clear form after successful submission
      this.clearEntries();
    } catch (error) {
      this.logger.error('Error submitting RSVP list', error);
      this.submitResult = {
        success: false,
        message: 'An error occurred during processing. Please try again.'
      };
      this.processing = false;
    }
  }
} 