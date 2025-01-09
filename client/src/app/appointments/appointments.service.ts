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

    private showComponentSource = new BehaviorSubject<boolean>(false);
    showComponent$ = this.showComponentSource.asObservable();

    // Método para actualizar la variable boolean
    setShowComponent(value: boolean) {
        this.showComponentSource.next(value);
    }

    // Método para obtener el valor actual de la variable boolean
    getShowComponent(): boolean {
        return this.showComponentSource.getValue();
    }

    //Emiter for the hours available
    private hoursAvailableSource = new BehaviorSubject<{ hour: string }[]>([]);
    hoursAvailable$ = this.hoursAvailableSource.asObservable();
    urlDate: string = '';

    constructor(private http: HttpClient) {
        this.dateSelected$.subscribe(date => {
            this.urlDate = this.formatDateToLocalString(date);
      });
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
        console.log("Se llama a coger las horas disponibles para la fecha: "+this.urlDate);
        return this.http.get<{ hour: string }[]>(`http://localhost:3000/schedule/${this.urlDate}`);
        
    }

    updateHoursAvailable(hours: { hour: string }[]) {
        this.hoursAvailableSource.next(hours);
        console.log(hours);
    }

    getAppointments() {
        
        // return this.http.get<Appointment[]>('http://localhost:3000/appointments');
        return this.http.get<Appointment[]>('http://localhost:3000/users/67800d44c1d0723ab7bc8f19/appointments');
        // 67800d44c1d0723ab7bc8f19
        // .subscribe((data: Appointment[]) => { 
            
        //     this.appointments = data;
        //     this.appointmentUpdate.next([...this.appointments]);

        // });
    }

    createAppointment(appointmet: Appointment) {
        console.log("Se llama a crear una cita");
        return this.http.post('http://localhost:3000/users/67800d44c1d0723ab7bc8f19/createAppointment', appointmet);
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
