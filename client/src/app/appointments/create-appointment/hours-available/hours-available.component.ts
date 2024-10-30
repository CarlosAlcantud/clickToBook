import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../appointments.service';

@Component({
  selector: 'hours-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hours-available.component.html',
  styleUrl: './hours-available.component.css'
})
export class HoursAvailableComponent implements OnInit {

  @Output() hourselcted = new EventEmitter();

  
  hoursAvailable: { hour: string }[] = [];

  constructor(private appointmentsService: AppointmentsService) {}

  ngOnInit() {
    this.appointmentsService.stablishUrlDate();
    this.appointmentsService.gethoursAvailable().subscribe(hours =>{
      this.appointmentsService.updateHoursAvailable(hours) ;
    });
    this.appointmentsService.hoursAvailable$.subscribe(hours => {
      this.hoursAvailable = hours;
    });
    
  }


  onClickHour(hour: {hour: string}) {
    this.hourselcted.emit(hour);

  };

}
