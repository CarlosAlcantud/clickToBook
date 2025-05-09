import { Component, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Appointment } from '../../appointment.model';
import { AppointmentsService } from '../../appointments.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
@Component({
  selector: 'book-appointment',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css',
  providers: [DatePipe]
})
export class BookAppointmentComponent {

  // Variables para recibir valores del componente create appointment
  @Input() appointment: Date | null = null; 
  @Input() hourSelected: string = '';


  finalAppointment: Appointment | null = null;
  date: string = '';
  haircutType : string = 'Corte de pelo';
  confirmed : boolean = false;
  paid: boolean = false;
  // Variable para mostrar la fecha en el formato deseado
  formatedDate: string = '';
  worker: boolean= false; // Almacena los appointments y al ser del tipo Appointment no permite otros valores.
  private workersub!: Subscription;

  constructor(private datePipe: DatePipe, private appointmentsService: AppointmentsService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.appointment) {
      this.formatedDate = this.datePipe.transform(this.appointment, "d 'de' MMMM yyyy", 'es-ES') || '';
      this.date = this.transformToISO(this.appointment);
    }
    this.authService.getWorkerStatusListener().subscribe((isWorker: boolean) => {
      this.worker = isWorker;
    } );
  }

  transformToISO(date: Date): string {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString();
  }

  pay(){
    console.log("Pagado");
    if (this.appointment && this.hourSelected) {
      console.log("El valor que se guarda como rawDate: "+this.appointment + " y el valor de date es: "+this.date);
      this.finalAppointment = {
        id: '',
        date: this.date,
        rawDate: this.appointment,
        hour: this.hourSelected,
        haircut: this.haircutType,
        confirmed: this.confirmed,
        paid: true
      }
      this.appointmentsService.createAppointment(this.finalAppointment);
      this.appointmentsService.setShowComponent(true);
    }
  }
  
}
