import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LoggerService } from '../../services/logger.service';
import { RsvpStatus } from '../../models/rsvp.model';

@Injectable({
  providedIn: 'root'
})
export class RsvpService {
  constructor(private logger: LoggerService) {}

  /**
   * Bulk add or update multiple player RSVPs
   * @param rsvpData Array of objects containing player and RSVP information
   * @returns Observable<number> Number of RSVPs processed
   */
  bulkAddOrUpdateRsvps(rsvpData: {
    name: string;
    email: string;
    status: RsvpStatus;
    notes?: string;
    guestCount?: number;
  }[]): Observable<number> {
    if (!rsvpData || !rsvpData.length) {
      this.logger.error('No valid RSVP data provided for bulk upload');
      return of(0);
    }

    const currentEntries = this.rsvpEntriesSubject.value;
    let newEntries = [...currentEntries];
    let processedCount = 0;

    // Process each RSVP entry
    rsvpData.forEach(data => {
      if (!data.name || !data.email || !data.status) {
        this.logger.warn(`Skipping invalid RSVP entry: ${JSON.stringify(data)}`);
        return;
      }

      // Look for existing player by email
      const existingPlayerIndex = currentEntries.findIndex(
        entry => entry.player.email.toLowerCase() === data.email.toLowerCase()
      );

      const newRsvp: RsvpEntry = {
        player: {
          id: existingPlayerIndex >= 0 
            ? currentEntries[existingPlayerIndex].player.id 
            : this.generateUniqueId(),
          name: data.name,
          email: data.email
        },
        status: data.status,
        responseDate: new Date(),
        notes: data.notes,
        guestCount: data.status === 'Yes' ? (data.guestCount || 0) : 0
      };

      if (existingPlayerIndex >= 0) {
        // Update existing entry
        newEntries[existingPlayerIndex] = newRsvp;
        this.logger.info(`Bulk update: Updated RSVP for ${data.name}`);
      } else {
        // Add new entry
        newEntries.push(newRsvp);
        this.logger.info(`Bulk update: Added new RSVP for ${data.name}`);
      }
      
      processedCount++;
    });

    // Update the subject with all new entries
    this.rsvpEntriesSubject.next(newEntries);
    
    return of(processedCount);
  }

  /**
   * Generate a unique ID for new players
   */
  private generateUniqueId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
} 