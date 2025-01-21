import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { app } from '../../server';
import { AppComponent } from './app.component';
import { CreateAppointmentComponent } from './appointments/create-appointment/create-appointment.component';
import { ShowAppointmentsComponent } from './appointments/show-appointments/show-appointments.component';
import { SingUpComponent } from './auth/singup/singup.component';

export const routes: Routes = [

    //Habilitar esta ruta en un futuro 
    {  path: 'create',  component: CreateAppointmentComponent},
    {  path: 'auth/login', component: LoginComponent},
    {  path: 'auth/register', component: SingUpComponent},  

];
