import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerAppointmentsComponent } from './worker-appointments.component';

describe('WorkerAppointmentsComponent', () => {
  let component: WorkerAppointmentsComponent;
  let fixture: ComponentFixture<WorkerAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerAppointmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkerAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
