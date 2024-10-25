import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursAvailableComponent } from './hours-available.component';

describe('HoursAvailableComponent', () => {
  let component: HoursAvailableComponent;
  let fixture: ComponentFixture<HoursAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursAvailableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HoursAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
