import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class ReservationService {

  private reservations: Reservation[] = [];
  private apiUrl = "http://localhost:3001"

  // wird nicht mehr benötigt, da jetz Mock-Daten verwendet werden
  // constructor() {
  //   const storedReservations = localStorage.getItem('reservations');
  //   if (storedReservations) {
  //     this.reservations = JSON.parse(storedReservations);
  //   }

  //   // Backfill IDs for older/local entries that don't have one yet.
  //   let didBackfillIds = false;
  //   this.reservations = this.reservations.map((reservation) => {
  //     if (reservation?.id) return reservation;
  //     didBackfillIds = true;
  //     return { ...reservation, id: this.generateId() };
  //   });
  //   if (didBackfillIds) {
  //     localStorage.setItem('reservations', JSON.stringify(this.reservations));
  //   }
  // }

constructor(
  private http: HttpClient) 
  {}

  // CRUD-Methoden für Reservierungen

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl + "/reservations");
  }

  getReservation(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(this.apiUrl + "/reservation/" + id);
  }

  addReservation(reservation: Reservation): Observable<void> {
    const reservationToAdd: Reservation = {
      ...reservation,
      id: reservation?.id || this.generateId(),
    };
    return this.http.post<void>(this.apiUrl + "/reservation", reservation);
    
  // wird nicht mehr benötigt, da jetz Mock-Daten verwendet werden ffff
//    localStorage.setItem('reservations', JSON.stringify(this.reservations));
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "/reservation/" + id);

  // wird nicht mehr benötigt, da jetz Mock-Daten verwendet werden
//    localStorage.setItem('reservations', JSON.stringify(this.reservations));
  }

  updateReservation(id: string, updatedReservation: Reservation): Observable<void> {
    return this.http.put<void>(this.apiUrl + "/reservation/" + id, updatedReservation);
  }

  private generateId(): string {
    const cryptoAny = globalThis.crypto as unknown as { randomUUID?: () => string } | undefined;
    if (typeof cryptoAny?.randomUUID === 'function') {
      return cryptoAny.randomUUID();
    }

    // Fallback for environments where Web Crypto is unavailable (e.g. non-secure context).
    return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
