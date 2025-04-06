import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CalendarService } from "../calendar.service";
import { AuthService } from "../../shared/auth.service";
import { Router } from "@angular/router";
import { Availability } from "../availability.model";

@Component({
  selector: "app-availability-form",
  templateUrl: "./availability-form.component.html",
  styleUrl: "./availability-form.component.css",
})
export class AvailabilityFormComponent implements OnInit {
  availabilityForm!: FormGroup;
  weekDays = [
    { id: 0, name: "Niedziela" },
    { id: 1, name: "Poniedziałek" },
    { id: 2, name: "Wtorek" },
    { id: 3, name: "Środa" },
    { id: 4, name: "Czwartek" },
    { id: 5, name: "Piątek" },
    { id: 6, name: "Sobota" },
  ];

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.availabilityForm = this.fb.group(
      {
        startDate: ["", Validators.required],
        endDate: [""],
        cyclical: [false],
        weekDays: this.fb.array([]),
        slots: this.fb.array([], [Validators.required]),
      },
      { validators: this.dateRangeValidator },
    );
    this.availabilityForm
      .get("cyclical")
      ?.valueChanges.subscribe((isCyclical) => {
        const weekDaysArray = this.availabilityForm.get(
          "weekDays",
        ) as FormArray;
        weekDaysArray.clear();
        if (isCyclical) {
          this.weekDays.forEach(() =>
            weekDaysArray.push(this.fb.control(false)),
          );
        }
      });
    this.availabilityForm.get("startDate")?.valueChanges.subscribe(() => {
      this.availabilityForm.updateValueAndValidity();
    });

    this.availabilityForm.get("endDate")?.valueChanges.subscribe(() => {
      this.availabilityForm.updateValueAndValidity();
    });
  }

  get slotsControls() {
    return (this.availabilityForm.get("slots") as FormArray).controls;
  }

  createTimeSlot() {
    return this.fb.group({
      start: ["", Validators.required],
      end: ["", Validators.required],
    });
  }

  addTimeSlot() {
    const slots = this.availabilityForm.get("slots") as FormArray;
    slots.push(this.createTimeSlot());
  }

  removeTimeSlot(index: number) {
    const slots = this.availabilityForm.get("slots") as FormArray;
    slots.removeAt(index);
  }

  private dateRangeValidator(group: FormGroup) {
    const startDate = group.get("startDate")?.value;
    const endDate = group.get("endDate")?.value;
    const isCyclical = group.get("cyclical")?.value;

    if (isCyclical && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        return { dateRange: true };
      }
    }

    return null;
  }

  onSubmit() {
    if (this.availabilityForm.valid) {
      this.authService.getCurrentUser().then((user) => {
        if (!user) return;

        const formValue = this.availabilityForm.value;
        const availability: Omit<Availability, "id"> = {
          doctorId: user.uid,
          startDate: formValue.startDate,
          endDate: formValue.endDate || formValue.startDate,
          cyclical: formValue.cyclical,
          slots: formValue.slots,
          weekDays: formValue.cyclical
            ? formValue.weekDays
                .map((selected: boolean, index: number) =>
                  selected ? index : -1,
                )
                .filter((day: number) => day !== -1)
            : [],
        };

        this.calendarService
          .setDoctorAvailability(availability)
          .then(() => this.router.navigate(["/calendar"]))
          .catch((error) => console.error("Error:", error));
      });
    }
  }
}
