import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { ClientsListApi } from './clients-list-api.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsApiService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAllClientsList(): Observable<ClientsListApi[]> {
    return this.http.get<ClientsListApi[]>(this.apiUrl).pipe(
      map(response => response.map(item => ({
        id: item.id,
        email: item.email,
        nº_pedidos: item.nº_pedidos,
        ltv: item.ltv,
        tm: item.tm
      }))),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    return throwError(() => new Error(errorMessage));
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Error de red: ${error.error.message}`;
    }
    
    return this.getServerErrorMessage(error);
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 404:
        return 'Recurso no encontrado';
      case 400:
        return 'Solicitud incorrecta';
      case 500:
        return 'Error interno del servidor';
      default:
        return `Error del servidor: ${error.status} - ${error.message}`;
    }
  }
}
