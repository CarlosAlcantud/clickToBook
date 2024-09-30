import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsViewComponent } from './pages/appointments-view/appointments-view.component';

const routes: Routes = [
  // Define your routes here
  { path: '', component: AppointmentsViewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }