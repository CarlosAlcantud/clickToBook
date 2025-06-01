import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySchedulesComponent } from './modify-schedules.component';

describe('ModifySchedulesComponent', () => {
  let component: ModifySchedulesComponent;
  let fixture: ComponentFixture<ModifySchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifySchedulesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifySchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
