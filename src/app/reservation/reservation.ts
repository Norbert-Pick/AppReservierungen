import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root',
})

export class ReservationService {

  private reservations: Reservation[] = [];
  constructor() {
    const storedReservations = localStorage.getItem('reservations');
    if (storedReservations) {
      this.reservations = JSON.parse(storedReservations);
    }
  }

  // CRUD-Methoden für Reservierungen

  getAllReservations(): Reservation[] {
    return this.reservations;
  }

  getReservation(id: string): Reservation | null {
    return this.reservations.find(r => r.id === id) || null;
  }

  addReservation(reservation: Reservation): void {
    reservation.id = crypto.randomUUID();
    this.reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(this.reservations));
  }

  deleteReservation(id: string): void {
    this.reservations = this.reservations.filter(r => r.id !== id);
    localStorage.setItem('reservations', JSON.stringify(this.reservations));
  }

  updateReservation(updatedReservation: Reservation): void {
    const index = this.reservations.findIndex(r => r.id === updatedReservation.id);
    if (index !== -1) {
      this.reservations[index] = updatedReservation;
      localStorage.setItem('reservations', JSON.stringify(this.reservations));
    }
  }
}
