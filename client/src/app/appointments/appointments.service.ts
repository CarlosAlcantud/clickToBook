import { Injectable } from "@angular/core";
import { Appointment } from "./appointment.model";
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AppointmentsService {
    appointments: Appointment[] = [];
    private appointmentUpdate = new Subject<Appointment[]>();

    constructor(private http: HttpClient) {}

    getAppointments() {
        return this.http.get<Appointment[]>('http://localhost:3000/appointments');
        
        // .subscribe((data: Appointment[]) => { 
            
        //     this.appointments = data;
        //     this.appointmentUpdate.next([...this.appointments]);

        // });
    }

    getAppointmentUpdateListener() {
        return this.appointmentUpdate.asObservable();
    }



    addAppointmet(id: string, date: Date, haircutType: string, confirmed: boolean, paid: boolean) {
        const appointment: Appointment = {
            id: id,
            date: date,
            haircutType: haircutType,
            confirmed: confirmed,
            paid: paid
        };
        this.appointments.push(appointment);
        this.appointmentUpdate.next([...this.appointments]);
        
    }

}
