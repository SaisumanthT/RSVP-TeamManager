import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RsvpStats } from '../../models/rsvp.model';
import { RsvpService } from '../../services/rsvp.service';

@Component({
  selector: 'app-rsvp-stats',
  templateUrl: './rsvp-stats.component.html',
  styleUrls: ['./rsvp-stats.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RsvpStatsComponent implements OnInit {
  rsvpStats$!: Observable<RsvpStats>;
  
  constructor(private rsvpService: RsvpService) {}
  
  ngOnInit(): void {
    this.rsvpStats$ = this.rsvpService.getRsvpStats();
  }
} 