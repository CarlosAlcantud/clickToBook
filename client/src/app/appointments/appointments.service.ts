import { Injectable } from "@angular/core";
import { Appointment } from "./appointment.model";
import { Subject, BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { create } from "domain";
import { WorkerAppointment } from "./workerAppointment.model";
import { formatDate } from "@angular/common";
import { AuthService } from "../auth/auth.service";

@Injectable({providedIn: 'root'})
export class AppointmentsService{

    //Emiter For the appointments 
    appointments: Appointment[] = [];
    private appointmentUpdate = new Subject<Appointment[]>();
    
    workerAppointments: WorkerAppointment[] = [];
    private workerAppointmentUpdate = new Subject<WorkerAppointment[]>();


    private completedDate = new Subject<String>();
    completedDate$ = this.completedDate.asObservable();
    //Emiter for the date 
    private dateSelectedSource = new BehaviorSubject<Date>(new Date());
    dateSelected$ = this.dateSelectedSource.asObservable();

    private showComponentSource = new BehaviorSubject<boolean>(false);
    showComponent$ = this.showComponentSource.asObservable();

    //Emiter for the hours available
    private hoursAvailableSource = new BehaviorSubject<{ hour: string }[]>([]);
    hoursAvailable$ = this.hoursAvailableSource.asObservable();
    urlDate: string = '';

    constructor(private http: HttpClient, private autService: AuthService) {
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
                "http://localhost:3000/appointments/forUser", 
            ).pipe(
                map((appointmentData) => {
               
                return appointmentData.appointments.map(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    return {
                        id: appointment._id,
                        date: this.formatDate(appointmentDate),
                        rawDate: appointmentDate,
                        hour: this.formatUTCTime(appointmentDate),
                        haircut: appointment.haircut,
                        confirmed: appointment.confirmed,
                        paid: appointment.paid
                        
                    };
                }
                )
            }))
            .subscribe(appointment => {
                this.appointments = appointment.sort((a, b) => {
                    return a.rawDate.getTime() - b.rawDate.getTime(); // Comparamos timestamps
                });
                this.appointmentUpdate.next([...this.appointments]);
        });

    }

    getAppointmentUpdateListener() {
        return this.appointmentUpdate.asObservable();
    }

    getWorkerAppointments(fecha: String) {
        console.log("getWorkerAppointments, la fecha seleccionada es "+ this.urlDate + " y la fecha pasada por parametros es: "+fecha);
        this.http
            .get<{ message: string; workerAppointments: any[] }>(
                "http://localhost:3000/worker/Appointments", 
            )
            .pipe(
                map((appointmentData) => {
               
                return appointmentData.workerAppointments.map(workerappointment => {
                    console.log(" getWorkerAppointments - appointmentsService - El worker appointment despues de traerlo de bbdd es: " + JSON.stringify(workerappointment));
                    const appointmentDate = new Date(workerappointment.date);
                    return {
                        id: workerappointment._id,
                        userName: workerappointment.userId.username,
                        fechaCompleta: this.formatDate(appointmentDate),
                        date: appointmentDate.toLocaleDateString(),
                        hour: this.formatUTCTime(appointmentDate),
                        haircut: workerappointment.haircut,
                        confirmed: workerappointment.confirmed,
                        paid: workerappointment.paid,
                        rawDate: appointmentDate
                    };
                }
                )
            }))
            .subscribe(workerappointment => {
                this.workerAppointments = workerappointment.sort((a, b) => {
                    return a.rawDate.getTime() - b.rawDate.getTime(); // Comparamos timestamps
                });
                
                // Removemos rawDate si no lo necesitas en el resultado final
    

                
                console.log("Los appointments son: " + JSON.stringify(this.workerAppointments));
                this.workerAppointmentUpdate.next([...this.workerAppointments]);
                
        });

    }

    getWorkerAppointmentUpdateListener() {
        return this.workerAppointmentUpdate.asObservable();
    }

    createAppointment(appointmet: Appointment) {
        let data; 
        if( this.autService.getWorkerStatusListener()) {
            console.log(' Vamos a añadir el appointment y los datos del cliente',this.autService.getClient());
            data = {
                appointment: appointmet,
                user: this.autService.getClient(),

            }
            console.log('Los datos que se envian al back son: ', data.user.clientId, data.user.clientWorker, data.appointment);
        }else{
            data = appointmet;
        }

        this.http
            .post<{message: string }>(
                "http://localhost:3000/appointments/createAppointment",data)
            .subscribe(responseData => {
                console.log(responseData.message);
                this.appointments.push(appointmet);
                this.appointmentUpdate.next([...this.appointments]);
                
                    
           });

    }

    deleteAppointment(appointmentId: string) {
        this.http
            .delete("http://localhost:3000/appointments/deleteAppointment/" + appointmentId)
            .subscribe(() => {
                // Eliminar del array de citas del trabajador
                
                this.workerAppointments = this.workerAppointments.filter(
                    appointment => appointment.id !== appointmentId
                );
                
                // Emitir la nueva lista actualizada
                this.workerAppointmentUpdate.next([...this.workerAppointments]);

                this.appointments = this.appointments.filter(
                    appointment => appointment.id !== appointmentId
                );

                this.appointmentUpdate.next([...this.appointments]);
            });
    }

    updateAppointment(appointmentId: string, date: string, rawDate: Date) {
        console.log('Los valores que se pasaran al back son : fecha: ' + date + " y el id: " + appointmentId);
        
        const updateData = { 
          appointmentId: appointmentId,
          date: date,
          rawDate: rawDate
        };
        
        return this.http.patch<{message: string, appointment?: any}>(
            "http://localhost:3000/appointments/updateAppointment", 
            updateData
          );
    }

    
    //Provide the date selected
    emitDateSelected(date: Date) {
        console.log('Servicio emitiendo fecha:', date);
        this.urlDate = this.formatDateToLocalString(date);
        this.dateSelectedSource.next(date);
      }
    
    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date);
    
      }
    
      formatDateForDatabase(date: Date, hour: string): string {
        const [hours, minutes] = hour.split(':').map(Number);
        console.log('formatDateForDataBase() - La fecha es '+date)
        
        // Crear una fecha ISO directamente combinando la fecha y hora
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hourStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        
        // Crear string ISO directamente (YYYY-MM-DDTHH:MM:00Z)
        const isoString = `${year}-${month}-${day}T${hourStr}:${minutesStr}:00.000Z`;
        
        console.log('formatDateForDataBase() - Fecha ISO creada: ' + isoString);
        return isoString;
    }

    // Add this method to your AppointmentsService class
    formatUTCTime(date: Date): string {
        // Extract hours and minutes from UTC time
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        
        // Return in HH:MM format
        return `${hours}:${minutes}`;
    }


    addClasses(classes: number) {
        const data = {
            userId: this.autService.getClient().clientId,
            classes: classes
        };
        console.log("El id del cliente es: " + this.autService.getClient().clientId + " y el numero de clases es: " + classes);
        return this.http.patch<{message: string}>(
            "http://localhost:3000/user/addClasses", data
        );
    }
}
