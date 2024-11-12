import { Component, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Appointment } from '../../appointment.model';
import { AppointmentsService } from '../../appointments.service';
@Component({
  selector: 'book-appointment',
  standalone: true,
  imports: [],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css',
  providers: [DatePipe]
})
export class BookAppointmentComponent {

  finalAppointment: Appointment | null = null;

  @Input() appointment: Date | null = null; // El valor que quiero recibir de otro componente. 
  @Input() hour: string = '';
  
  formatedDate: string = '';

 
  constructor(private datePipe: DatePipe, private appointmentsService: AppointmentsService) {}

  ngOnInit(): void {
    if (this.appointment) {
      this.formatedDate = this.datePipe.transform(this.appointment, "d 'de' MMMM yyyy", 'es-ES') || '';
    }
  }

  pay(){
    

  }
  
}
