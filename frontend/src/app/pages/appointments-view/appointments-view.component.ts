import { Component, OnInit } from '@angular/core';
import User from '../../../models/user';
import Appointment from '../../../models/appointment';
import { AppointmentService } from '../../appointment.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-appointments-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-view.component.html',
  styleUrl: './appointments-view.component.scss'
})
export class AppointmentsViewComponent implements OnInit {
  appointments: Appointment[] = [];
  users: User[] = [];

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit() {
    this.appointmentService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });
  }
}
