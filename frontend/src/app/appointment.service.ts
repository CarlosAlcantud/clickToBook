import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import { Observable } from 'rxjs';
import User from '../../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private webService: WebService) { 
  }

  getUsers(): Observable<User[]> {
    return this.webService.get<User[]>(`/users`);
  }

  createUser(username: string, password: string, email: string, telephone: string){
    return this.webService.post('createUser', {username, password, email, telephone});
  }

  getAppointmentsUser(userId: string){
    return this.webService.get(`users/${userId}/appointments`);
  }
  
  getAppointments(){
    return this.webService.get('appointments');
  }

  createAppointment(userId: string, date: string, haircut: string, confirmed: boolean, paid:boolean){
    return this.webService.post(`users/${userId}/createAppointment`, {date, haircut, confirmed, paid});
  }

  deleteUsers(userId: string){
    return this.webService.delete(`users/${userId}`);
  }

  //To be Completed with all the requests needed for the appointments


}
