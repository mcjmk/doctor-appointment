import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DoctorEditDialogComponent } from "./doctor-edit-dialog.component";

describe("DoctorEditDialogComponent", () => {
  let component: DoctorEditDialogComponent;
  let fixture: ComponentFixture<DoctorEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorEditDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
