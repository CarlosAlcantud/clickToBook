import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Appointment } from '../../appointment.model';
import { AppointmentsService } from '../../appointments.service';
import { RouterModule, Router } from '@angular/router';
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
  @Output() reset = new EventEmitter<void>();

  finalAppointment: Appointment | null = null;
  date: string = '';
  haircutType : string = 'Corte de pelo';
  confirmed : boolean = false;
  paid: boolean = false;
  
  dateToShow: string = '';
  worker: boolean= false; // Almacena los appointments y al ser del tipo Appointment no permite otros valores.
  private workersub!: Subscription;
  showResponseDialog: boolean = false; // Variable para mostrar/ocultar el diálogo de respuesta
  messageDialog: string = ''; // Mensaje del diálogo de respuesta
  constructor(private datePipe: DatePipe, private appointmentsService: AppointmentsService, private authService: AuthService, private router: Router) {}
  finalData: any = null;

  ngOnInit(): void {
    if (this.appointment) {
      this.dateToShow = this.appointmentsService.formatDate(this.appointment);
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
    if (this.appointment && this.hourSelected) {
      this.finalAppointment = {
        id: '',
        date: this.date,
        rawDate: this.appointment,
        hour: this.hourSelected,
        haircut: this.haircutType,
        confirmed: this.confirmed,
        paid: true
      }
      
      this.finalData = this.appointmentsService.createAppointment(this.finalAppointment).subscribe({
        next: (response) => {
          this.showResponseDialog = true; // Mostrar el diálogo de respuesta
          this.messageDialog = response.message; // Asignar el mensaje de respuesta
           // Asignar la fecha formateada
        },
        error: (error) => {
          this.showResponseDialog = true; // Mostrar el diálogo de respuesta
          this.messageDialog = error.message;
        },  
      });
    }
  }


  reRoute() {
    this.router.navigate(['/showappointments']);
  }

  volver() {
    this.appointment = null;
    this.hourSelected = '';
    this.reset.emit();
  
  }
  
}
