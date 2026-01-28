import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ReservationService } from '../reservation/reservation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css',
})

export class ReservationForm implements OnInit {
  reservationForm: FormGroup = new FormGroup({});

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private reservationService: ReservationService
  ) {
    this.reservationForm = this.formBuilder.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guestName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      guestEmail: ['', [Validators.required, Validators.email]],
      roomNumber: ['', Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    // Component initialization (no-op)
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      // Hier können Sie die Reservierung speichern
      this.reservationService.addReservation(this.reservationForm.value);

      // Formular zurücksetzen nach dem Absenden
      this.reservationForm.reset();

      // Navigieren Sie zurück zur Reservierungsliste
      this.router.navigate(['/list']);

    }
  }

  // Validator: check that checkOutDate is after checkInDate
  dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const checkInVal = group.get('checkInDate')?.value;
    const checkOutVal = group.get('checkOutDate')?.value;

    if (!checkInVal || !checkOutVal) return null;

    const checkIn = new Date(checkInVal);
    const checkOut = new Date(checkOutVal);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return null;

    const outControl = group.get('checkOutDate');

    if (checkOut <= checkIn) {
      // add dateRange error to the control without clobbering other errors
      const existing = outControl?.errors ? { ...outControl.errors } : {};
      existing['dateRange'] = true;
      outControl?.setErrors(existing);
      return { dateRange: true };
    }

    // remove only the dateRange error if present
    if (outControl?.hasError('dateRange')) {
      const errors = { ...outControl.errors } as any;
      delete errors['dateRange'];
      const keys = Object.keys(errors || {});
      outControl.setErrors(keys.length ? errors : null);
    }

    return null;
  }

}
