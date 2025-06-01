import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'worker',
  standalone: true,
  imports: [RouterOutlet,  RouterModule, NgIf],
  templateUrl: './worker.component.html',
  styleUrl: './worker.component.css'
})
export class WorkerComponent {

  constructor(private router: Router) {}

  isExamsRoute(): boolean {
    const currentUrl = this.router.url;
    if(currentUrl.includes('/worker/exams')) {
      return true;

    }
    return false;
  }

  isSchedulesActive(): boolean {
    const currentUrl = this.router.url;
    if(currentUrl.startsWith('/worker/schedules')) {
      return true;
    }
    return false; 

  }

  isLinkActive(route: string): boolean {
  return this.router.url === route || this.router.url.startsWith(route + '/');
}

}
