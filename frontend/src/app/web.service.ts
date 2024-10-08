import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class WebService {
  readonly ROOT_URL;
  
  constructor(private Http: HttpClient) {
    
    this.ROOT_URL = "http://localhost:3000";
  }
  
  
  get(uri: string){
    return this.Http.get(`${this.ROOT_URL}/${uri}`);
  }

  post(uri: string, payload: Object){
    return this.Http.post(`${this.ROOT_URL}/${uri}`, payload);
  }

  patch(uri: string, payload: Object){
    return this.Http.patch(`${this.ROOT_URL}/${uri}`, payload);
  }

  delete(uri: string){
    return this.Http.delete(`${this.ROOT_URL}/${uri}`);
  }





}
