import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterWorkerComponent } from './register-worker.component';

describe('RegisterWorkerComponent', () => {
  let component: RegisterWorkerComponent;
  let fixture: ComponentFixture<RegisterWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterWorkerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
