import { Component } from '@angular/core';

@Component({
  selector: 'app-appointments-view',
  standalone: true,
  imports: [],
  templateUrl: './appointments-view.component.html',
  styleUrl: './appointments-view.component.scss'
})
export class AppointmentsViewComponent {

  appointments: any[] = [];

  
  constructor() { }

  ngOnInit(){

  }

}
