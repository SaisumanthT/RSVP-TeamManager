import { Player } from './player.model';

//Available RSVP status options
export type RsvpStatus = 'Yes' | 'No' | 'Maybe';

//Represents a player's RSVP response
export interface RsvpEntry {
  player: Player;
  status: RsvpStatus;
  responseDate: Date;
  notes?: string;
  guestCount?: number;
}

//Summary of RSVP statistics

export interface RsvpStats {
  total: number;
  confirmed: number;
  declined: number;
  maybe: number;
  totalGuests: number; // Total number of additional guests (not including players)
  totalAttendees: number; // Total of confirmed players + their guests
} 