import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../reservation/reservation';
import { Reservation } from '../models/reservation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css',
})

export class ReservationList implements OnInit {
  reservations: Reservation[] = [];

  constructor(
    private reservationService: ReservationService,
    private router: Router,
  ) {}
  
  ngOnInit(): void {
    this.reservations = this.reservationService.getAllReservations();
  }

deleteReservation(id: string): void {
  this.reservationService.deleteReservation(id);
  this.reservations = this.reservationService.getAllReservations();
}

navigateNewReservation() {
    this.router.navigate(['/new']);
  }

}
