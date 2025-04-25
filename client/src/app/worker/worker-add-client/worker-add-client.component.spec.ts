import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerAddClientComponent } from './worker-add-client.component';

describe('WorkerAddClientComponent', () => {
  let component: WorkerAddClientComponent;
  let fixture: ComponentFixture<WorkerAddClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerAddClientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkerAddClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
