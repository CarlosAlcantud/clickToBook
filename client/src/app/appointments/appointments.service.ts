import { Injectable } from "@angular/core";
import { Appointment } from "./appointment.model";
import { Subject, BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

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

    //Emiter for the hours available
    private hoursAvailableSource = new BehaviorSubject<{ hour: string }[]>([]);
    hoursAvailable$ = this.hoursAvailableSource.asObservable();
    urlDate: string = '';

    constructor(private http: HttpClient) {
        this.dateSelected$.subscribe(date => {
            this.urlDate = this.formatDateToLocalString(date);
      });
    }

    // Método para actualizar la variable boolean
    setShowComponent(value: boolean) {
        this.showComponentSource.next(value);
    }

    // Método para obtener el valor actual de la variable boolean
    getShowComponent(): boolean {
        this.getAppointments();
        return this.showComponentSource.getValue();
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
        this.http
            .get<{ message: string; appointments: any[] }>(
                "http://localhost:3000/users/679f459b8e5741c66ff14a23/appointments", 
            )
            .pipe(map((appointmentData) => {
               
                return appointmentData.appointments.map(appointment => {
                    return {
                        id: appointment._id,
                        date: appointment.date,
                        haircut: appointment.haircut,
                        confirmed: appointment.confirmed,
                        paid: appointment.paid
                    };
                }
                );
            }))
            .subscribe(appointments => {
                this.appointments = appointments;
                this.appointmentUpdate.next([...this.appointments]);
        });

    }

    getAppointmentUpdateListener() {
        return this.appointmentUpdate.asObservable();
    }

    createAppointment(appointmet: Appointment) {
        // console.log("Se llama a crear una cita");
        // return this.http.post('http://localhost:3000/users/67800d44c1d0723ab7bc8f19/createAppointment', appointmet);
        this.http
            .post<{message: string }>(
                "http://localhost:3000/users/679f459b8e5741c66ff14a23/createAppointment",appointmet)
            .subscribe(responseData => {
                console.log(responseData.message);
                this.appointments.push(appointmet);
                this.appointmentUpdate.next([...this.appointments]);
           });

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
