# RSVP-TeamManager

A lightweight, scalable TypeScript service to manage RSVP responses for events on the Gametime Hero platform. Supports adding/updating player RSVP statuses ("Yes", "No", "Maybe"), retrieving confirmed attendees, and counting total, confirmed, and declined responses.

## Features
- Add or update a player's RSVP status
- Get a list of all confirmed attendees
- Count the number of total, confirmed, and declined responses

## RSVP Options

1. **Individual RSVP**: 
   -To RSVP individually, navigate to the individual RSVP section and fill in your details.
   - <img width="823" alt="Individual RSVP" src="https://github.com/user-attachments/assets/bcdbc285-1592-4dc2-87c0-fc32203d184c" />


2. **Bulk RSVP via List**: 
   - Users can add multiple rows to a list to RSVP for several individuals at once. This feature is particularly useful for group RSVPs, allowing users to submit multiple attendees in one go.
   - <img width="793" alt="RSVP List" src="https://github.com/user-attachments/assets/b2fd46d0-0b3d-4cc8-a187-a2a8230ae67d" />

## Technical Implementation
- Clean, testable TypeScript code
- Pure functions where possible
- Clear and reusable interfaces
- Dependency injection
- Single Responsibility Principle
- Consistent naming and code style
