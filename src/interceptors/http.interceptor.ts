import { Injectable } from '@angular/core';
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class UserRequestInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf('game') === -1) {
      return next.handle(req);
    }

     const httpHeaders = new HttpHeaders().append('user', 'juanky');

    const newRequest = req.clone({headers : httpHeaders});
    return next.handle(newRequest);
  }
}
