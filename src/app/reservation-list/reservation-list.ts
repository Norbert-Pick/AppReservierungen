import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../reservation/reservation';
import { Reservation } from '../models/reservation';
import { Router, RouterLink } from '@angular/router';
import { APP_SETTINGS } from '../app-settings';
import { Home } from '../home/home';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-reservation-list',
  imports: [FormsModule, CommonModule, RouterLink, Home],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css',
})

export class ReservationList implements OnInit {
  reservations: Reservation[] = [];
  protected readonly testModus = inject(APP_SETTINGS).testModus;

  constructor(
    private reservationService: ReservationService,
    private router: Router,
  ) {}
  
  ngOnInit(): void {
    this.reservationService.getReservations().subscribe( reservations => {
      this.reservations = reservations;
    });
  }

deleteReservation(id: string) {
  this.reservationService.deleteReservation(id).subscribe( () => {
    alert("Löschen wird durchgeführt"); 
    //this.reservations = this.reservations.filter(r => r.id !== id);
  });
}


navigateNewReservation() {
    this.router.navigate(['/new']);
  }

}
