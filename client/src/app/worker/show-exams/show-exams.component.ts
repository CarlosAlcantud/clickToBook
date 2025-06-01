import { Component } from '@angular/core';
import { AppointmentsService } from '../../appointments/appointments.service';
import { Exam } from '../../appointments/exam.model';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'app-show-exams',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './show-exams.component.html',
  styleUrl: './show-exams.component.css'
})
export class ShowExamsComponent {
  exams: Exam[] = []; // Almacena los exámenes
  private examsSub!: Subscription;
  expandedIndex: number = -1;
  expandedEnrolledStudents: number = -1;
  expandedPotentialStudents: number = -1;
  constructor(private appointmentsService: AppointmentsService) { }

    ngOnInit() {
        
        this.appointmentsService.getExams();
        this.examsSub = this.appointmentsService.getExamsUpdateListener()
          .subscribe((exams: Exam[]) => {
            this.exams = exams;
        });
        
        this.appointmentsService.getExams(); 
      }
    
      ngOnDestroy(){ 
       
          this.examsSub.unsubscribe();
        
      }
      expand(index: number) {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
    // Reset the inner expansions when closing the main section
    if (this.expandedIndex === -1) {
      this.expandedEnrolledStudents = -1;
      this.expandedPotentialStudents = -1;
    }
  }

  expandEnrolledStudents(index: number) {
    if (event) {
      event.stopPropagation(); // Prevent the main expand from triggering
    }
    this.expandedEnrolledStudents = this.expandedEnrolledStudents === index ? -1 : index;
  }

  expandPotentialStudents(index: number) {
    if (event) {
      event.stopPropagation(); // Prevent the main expand from triggering
    }
    this.expandedPotentialStudents = this.expandedPotentialStudents === index ? -1 : index;
  }

}
