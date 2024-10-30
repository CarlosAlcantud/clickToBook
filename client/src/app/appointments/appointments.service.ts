import { Injectable } from "@angular/core";
import { Appointment } from "./appointment.model";
import { Subject, BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AppointmentsService{

    //Emiter For the appointments 
    appointments: Appointment[] = [];
    private appointmentUpdate = new Subject<Appointment[]>();
     
    //Emiter for the date 

    private dateSelected = new Subject<Date>();
    dateSelected$ = this.dateSelected.asObservable();

    //Emiter for the hours available
    private hoursAvailableSource = new BehaviorSubject<{ hour: string }[]>([]);
    hoursAvailable$ = this.hoursAvailableSource.asObservable();
    urlDate: string = '';

    constructor(private http: HttpClient) {
    }

    stablishUrlDate() {
        this.urlDate = this.formatDateToLocalString(new Date());
    }
        
    formatDateToLocalString(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    gethoursAvailable() {
        return this.http.get<{ hour: string }[]>(`http://localhost:3000/schedule/${this.urlDate}`);
        
    }

    updateHoursAvailable(hours: { hour: string }[]) {
        this.hoursAvailableSource.next(hours);
        console.log(hours);
    }
    getAppointments() {
        return this.http.get<Appointment[]>('http://localhost:3000/appointments');
        
        // .subscribe((data: Appointment[]) => { 
            
        //     this.appointments = data;
        //     this.appointmentUpdate.next([...this.appointments]);

        // });
    }



    // getAppointmentUpdateListener() {
    //     return this.appointmentUpdate.asObservable();
    // }

    // addAppointmet(id: string, date: Date, haircutType: string, confirmed: boolean, paid: boolean) {
    //     const appointment: Appointment = {
    //         id: id,
    //         date: date,
    //         haircutType: haircutType,
    //         confirmed: confirmed,
    //         paid: paid
    //     };
    //     this.appointments.push(appointment);
    //     this.appointmentUpdate.next([...this.appointments]);
        
    // }


    //Provide the date selected
    emitDateSelected(date: Date) {
        this.dateSelected.next(date);
    }

}
