import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'hours-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hours-available.component.html',
  styleUrl: './hours-available.component.css'
})
export class HoursAvailableComponent {

  @Output() hourselcted = new EventEmitter();


  hours: { hour: string, available: boolean }[] = [

    { hour : '8:00 am', available: true },
    { hour : '9:00 am', available: true },
    { hour : '9:15 am', available: true },
    { hour : '10:00 am', available: true },

  ]; 

  onClickHour(hour: string) {
    this.hourselcted.emit(hour);

  };

}
