import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_SETTINGS } from '../app-settings';
import { ReservationService } from '../reservation/reservation';
import { Home } from '../home/home';
import { distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-reservation-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Home
  ],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css',
})

export class ReservationForm implements OnInit {
  reservationForm: FormGroup = new FormGroup({});
  protected readonly testModus = inject(APP_SETTINGS).testModus;
  protected isEditMode = false;
  protected isCompletedStay = false;

  // Validator: check that checkInDate is not before today (local date)
  private readonly notBeforeTodayValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = control.value as string | null | undefined;
    if (!value) return null;

    // date input uses 'YYYY-MM-DD' -> parse as local date to avoid timezone shifts
    const parts = String(value).split('-').map((p) => Number(p));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
    const [year, month, day] = parts;
    const checkIn = new Date(year, month - 1, day);
    if (Number.isNaN(checkIn.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);

    return checkIn < today ? { minToday: true } : null;
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private reservationService: ReservationService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.reservationForm = this.formBuilder.group({
      id: [{ value: '', disabled: true }],
      checkInDate: ['', [Validators.required, this.notBeforeTodayValidator]],
      checkOutDate: ['', Validators.required],
      guestName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      guestEmail: ['', [Validators.required, Validators.email]],
      roomNumber: ['', Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((paramMap) => paramMap.get('id')),
        distinctUntilChanged(),
      )
      .subscribe((id) => {
        this.isEditMode = !!id;

        if (id) {
          this.reservationService.getReservation(id).subscribe((reservation) => {
            if (reservation) {
              this.reservationForm.patchValue(reservation);
              this.updateCompletedStay();
            }
          });
          return;
        }

        // When navigating from edit -> new while reusing the component, clear the form.
        this.reservationForm.reset();
        this.updateCompletedStay();
      });

    this.reservationForm.get('checkOutDate')?.valueChanges.subscribe(() => {
      this.updateCompletedStay();
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
//      const formValue = this.reservationForm.getRawValue();
      const reservation = this.reservationForm.value;

      if (id) {
        this.reservationService.updateReservation(id, reservation).subscribe({
          next: () => this.router.navigate(['/list']),
          error: (err) => console.error('updateReservation failed', err),
        });
      } else {
        this.reservationService.addReservation(reservation).subscribe({
          next: () => {
            this.reservationForm.reset();
            this.router.navigate(['/list']);
          },
          error: (err) => console.error('addReservation failed', err),
        });
      }
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

  private updateCompletedStay(): void {
    const checkOutValue = this.reservationForm.get('checkOutDate')?.value as string | null;
    this.isCompletedStay = this.isDateInPast(checkOutValue);

    if (this.isCompletedStay) {
      this.reservationForm.disable({ emitEvent: false });
      return;
    }

    this.reservationForm.enable({ emitEvent: false });
    this.reservationForm.get('id')?.disable({ emitEvent: false });
  }

  private isDateInPast(value: string | null | undefined): boolean {
    if (!value) return false;

    const parts = String(value).split('-').map((p) => Number(p));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today;
  }

}
