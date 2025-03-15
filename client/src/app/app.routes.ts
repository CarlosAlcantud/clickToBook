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
import { WorkerComponent } from './worker/worker.component';
import { WorkerAppointmentsComponent } from './worker/worker-appointments/worker-appointments.component';

export const routes: Routes = [
    {  path: '', component: PrincipalComponent},
    //Habilitar esta ruta en un futuro 
    {  path: 'create',  component: CreateAppointmentComponent, canActivate: [authGuard], data: {roles: ['client']}},
    {  path: 'auth/login', component: LoginComponent},
    {  path: 'auth/register', component: SingUpComponent}, 
    { path: 'showappointments', component: ShowAppointmentsComponent, canActivate: [authGuard], data: {roles: [ 'client']}},
    { 
        path: 'worker', 
        component: WorkerComponent, 
        canActivate: [authGuard], 
        data: {
            roles: ['worker']
        }, 
        children: [
            { path: 'appointments', component: WorkerAppointmentsComponent}
        ]
    
    },
    
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    
})
export class AppRoutes {
    
}