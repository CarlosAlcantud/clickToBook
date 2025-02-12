import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { app } from '../../server';
import { AppComponent } from './app.component';
import { CreateAppointmentComponent } from './appointments/create-appointment/create-appointment.component';
import { ShowAppointmentsComponent } from './appointments/show-appointments/show-appointments.component';
import { SingUpComponent } from './auth/singup/singup.component';
import { NgModule } from '@angular/core';
import { RouterModule} from '@angular/router';
import { PrincipalComponent } from './principal/principal.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {  path: '', component: PrincipalComponent},
    //Habilitar esta ruta en un futuro 
    {  path: 'create',  component: CreateAppointmentComponent, canActivate: [authGuard]},
    {  path: 'auth/login', component: LoginComponent},
    {  path: 'auth/register', component: SingUpComponent}, 
    { path: 'showappointments', component: ShowAppointmentsComponent, canActivate: [authGuard]} 
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    
})
export class AppRoutes {
    
}