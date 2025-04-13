import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '../models/player.model';
import { RsvpEntry, RsvpStatus, RsvpStats } from '../models/rsvp.model';
import { LoggerService } from './logger.service';

//Service for managing player RSVPs
@Injectable({
  providedIn: 'root'
})
export class RsvpService {
  // State management
  private rsvpEntriesSubject = new BehaviorSubject<RsvpEntry[]>([]);
  
  // Public observable that components can subscribe to
  public rsvpEntries$: Observable<RsvpEntry[]> = this.rsvpEntriesSubject.asObservable();
  
  constructor(private logger: LoggerService) {
    this.logger.info('RSVP Service initialized');
  }
  
  /**
   * Add or update a player's RSVP status
   * @param player The player submitting the RSVP
   * @param status The RSVP status (Yes/No/Maybe)
   * @param notes Optional notes from the player
   * @param guestCount Optional number of additional guests
   * @returns void
   */
  addOrUpdateRsvp(player: Player, status: RsvpStatus, notes?: string, guestCount?: number): void {
    if (!player || !player.id) {
      this.logger.error('Invalid player data provided');
      return;
    }
    
    const currentEntries = this.rsvpEntriesSubject.value;
    const existingEntryIndex = this.findPlayerEntryIndex(currentEntries, player.id);
    
    const updatedEntry: RsvpEntry = {
      player,
      status,
      responseDate: new Date(),
      notes,
      guestCount: status === 'Yes' ? guestCount || 0 : 0
    };
    
    if (existingEntryIndex >= 0) {
      this.updateExistingEntry(currentEntries, existingEntryIndex, updatedEntry);
      this.logger.info(`Updated RSVP for player: ${player.name} to ${status}`);
    } else {
      this.addNewEntry(currentEntries, updatedEntry);
      this.logger.info(`Added new RSVP for player: ${player.name} with status: ${status}`);
    }
  }

  /**
   * Get all RSVP entries
   * @returns Observable<RsvpEntry[]> All RSVP entries
   */
  getAllRsvpEntries(): Observable<RsvpEntry[]> {
    return this.rsvpEntries$;
  }

  /**
   * Get all players who have RSVPed
   * @returns Observable<Player[]> List of all players
   */
  getAllPlayers(): Observable<Player[]> {
    return this.rsvpEntries$.pipe(
      map(entries => entries.map(entry => entry.player))
    );
  }

  /**
   * Find a player by email
   * @param email Player email to search for
   * @returns Observable<Player | undefined> Player if found
   */
  findPlayerByEmail(email: string): Observable<Player | undefined> {
    return this.getAllPlayers().pipe(
      map(players => players.find(player => 
        player.email.toLowerCase() === email.toLowerCase()
      ))
    );
  }

  /**
   * Get RSVP entry for a specific player
   * @param playerId The player ID to find
   * @returns Observable<RsvpEntry | undefined> RSVP entry for the player or undefined
   */
  getRsvpEntryByPlayerId(playerId: string): Observable<RsvpEntry | undefined> {
    return this.rsvpEntries$.pipe(
      map(entries => entries.find(entry => entry.player.id === playerId))
    );
  }
  
  /**
   * Get a list of all confirmed attendees (players with 'Yes' status)
   * @returns Observable<Player[]> List of confirmed players
   */
  getConfirmedAttendees(): Observable<Player[]> {
    return this.rsvpEntries$.pipe(
      map(entries => this.filterPlayersByStatus(entries, 'Yes'))
    );
  }
  
  /**
   * Get comprehensive RSVP statistics
   * @returns Observable<RsvpStats> Current RSVP statistics
   */
  getRsvpStats(): Observable<RsvpStats> {
    return this.rsvpEntries$.pipe(
      map(entries => this.calculateRsvpStats(entries))
    );
  }
  
  /**
   * Get total number of RSVP responses
   * @returns Observable<number> Total count
   */
  getTotalResponsesCount(): Observable<number> {
    return this.rsvpEntries$.pipe(
      map(entries => entries.length)
    );
  }
  
  /**
   * Get number of confirmed responses ('Yes')
   * @returns Observable<number> Confirmed count
   */
  getConfirmedResponsesCount(): Observable<number> {
    return this.rsvpEntries$.pipe(
      map(entries => this.countEntriesByStatus(entries, 'Yes'))
    );
  }
  
  /**
   * Get number of declined responses ('No')
   * @returns Observable<number> Declined count
   */
  getDeclinedResponsesCount(): Observable<number> {
    return this.rsvpEntries$.pipe(
      map(entries => this.countEntriesByStatus(entries, 'No'))
    );
  }
    
  //Find the index of a player entry by player ID
  private findPlayerEntryIndex(entries: RsvpEntry[], playerId: string): number {
    return entries.findIndex(entry => entry.player.id === playerId);
  }
  
  // Updating an existing RSVP entry
  private updateExistingEntry(
    currentEntries: RsvpEntry[], 
    index: number, 
    updatedEntry: RsvpEntry
  ): void {
    const updatedEntries = [...currentEntries];
    updatedEntries[index] = updatedEntry;
    this.rsvpEntriesSubject.next(updatedEntries);
  }
  
  //Add a new RSVP entry
  private addNewEntry(currentEntries: RsvpEntry[], newEntry: RsvpEntry): void {
    this.rsvpEntriesSubject.next([...currentEntries, newEntry]);
  }
  
  //Filter players by a specific RSVP status
  private filterPlayersByStatus(entries: RsvpEntry[], status: RsvpStatus): Player[] {
    return entries
      .filter(entry => entry.status === status)
      .map(entry => entry.player);
  }
  
  //Counting entries with a specific status
  private countEntriesByStatus(entries: RsvpEntry[], status: RsvpStatus): number {
    return entries.filter(entry => entry.status === status).length;
  }
  
  //Calculate RSVP statistics
  private calculateRsvpStats(entries: RsvpEntry[]): RsvpStats {
    const confirmedCount = this.countEntriesByStatus(entries, 'Yes');
    const totalGuests = entries
      .filter(entry => entry.status === 'Yes' && entry.guestCount !== undefined)
      .reduce((sum, entry) => sum + (entry.guestCount || 0), 0);
    
    return {
      total: entries.length,
      confirmed: confirmedCount,
      declined: this.countEntriesByStatus(entries, 'No'),
      maybe: this.countEntriesByStatus(entries, 'Maybe'),
      totalGuests: totalGuests,
      totalAttendees: confirmedCount + totalGuests
    };
  }
} 