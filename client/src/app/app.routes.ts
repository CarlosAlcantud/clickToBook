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
import { WorkerAddClientComponent } from './worker/worker-add-client/worker-add-client.component';
import { EditAppointmentComponent } from './appointments/edit-appointment/edit-appointment.component';
import path from 'path';
import { CreateExamComponent } from './worker/create-exam/create-exam.component';
import { ShowExamsComponent } from './worker/show-exams/show-exams.component';


import { ConfirmationComponent } from './confirmation/confirmation/confirmation.component';
import { SchedulesComponent } from './worker/schedules/schedules.component';
import { ModifySchedulesComponent } from './worker/modify-schedules/modify-schedules.component';
import { RegisterWorkerComponent } from './auth/register-worker/register-worker.component';
export const routes: Routes = [
    {  path: '', component: PrincipalComponent},
    //Habilitar esta ruta en un futuro 
    {
        path: 'confirmation/:type/:token',
        component: ConfirmationComponent,
    },
    {  path: 'create',  component: CreateAppointmentComponent, canActivate: [authGuard], data: {roles: ['client']}},
    {  path: 'auth/login', component: LoginComponent},
    {  path: 'auth/register', component: SingUpComponent, canActivate: [authGuard], data: {roles: ['worker']}},
    { path: 'auth/register-worker', component: RegisterWorkerComponent, canActivate: [authGuard], data: {roles: ['worker']}},
    {  path: 'showappointments/edit-appointment', component: EditAppointmentComponent, canActivate: [authGuard], data: {roles: ['client']}},
    { path: 'showappointments', component: ShowAppointmentsComponent, canActivate: [authGuard], data: {roles: [ 'client']}},
    { 
        path: 'worker', 
        component: WorkerComponent, 
        canActivate: [authGuard], 
        data: {
            roles: ['worker']
        }, 
        children: [
            {path: 'exams',
                children: [
                    {path: 'create-exam', component: CreateExamComponent},
                    {path: 'list-exams', component: ShowExamsComponent,}
                ] 
            },
            {
                path: 'schedules/create-consult', component: SchedulesComponent,
            },
            {
                path: 'schedules/modify-schedule', component: ModifySchedulesComponent
            },
            { path: 'appointments', 
                component: WorkerAppointmentsComponent,
                // children: [
                //     { path: 'edit-appointment', component: EditAppointmentComponent}
                // ]
            },
            { path: 'add-client', component: WorkerAddClientComponent, 
                children: [
                    {path: 'registerStudent', component: SingUpComponent},
                    {path: 'bookAppointment', component: CreateAppointmentComponent},
                ]

            },
            { path: 'appointments/edit-appointment', component: EditAppointmentComponent},
            { path: 'student/bookClass', component: CreateAppointmentComponent,}
        ]
    
    },
    
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    
})
export class AppRoutes {
    
}