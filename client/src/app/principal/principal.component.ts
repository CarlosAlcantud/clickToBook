import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'principal',
  standalone: true,
  imports: [NgIf,RouterModule],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})

export class PrincipalComponent implements OnInit,OnDestroy {

  userIsAuthenticated = false;
  
  private authListenerSubs: Subscription = new Subscription();
  

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      
      this.userIsAuthenticated = isAuthenticated;
      
    }); 
  }

  ngOnDestroy() {
    console.log("NavBarComponent ngOnDestroy called");
    this.authListenerSubs.unsubscribe();
  }
}