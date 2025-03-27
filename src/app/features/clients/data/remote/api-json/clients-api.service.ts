import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { ClientsListApi } from './clients-list-api.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsApiService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAllClientsList(): Observable<ClientsListApi[]> {
    console.log('ClientsApiService: Fetching clients from:', this.apiUrl);
    
    return this.http.get<ClientsListApi[]>(this.apiUrl).pipe(
      map(response => response.map(item => ({
        id: item.id,
        email: item.email,
        nº_pedidos: item.nº_pedidos,
        ltv: item.ltv,
        tm: item.tm
      }))),
      tap(clients => console.log('ClientsApiService: Received response:', clients)),
      catchError(this.handleError)
    );
  }

  getTotalClients(): Observable<number> {
    return this.getAllClientsList().pipe(
      map(clients => clients.length),
      tap(total => console.log('ClientsApiService: Total clients:', total)),
      catchError(this.handleError)
    );
  }

  getTotalAverageOrders(): Observable<number> {
    return this.getAllClientsList().pipe(
      map(clients => {
        const sum = clients.reduce<number>((acc, client) => acc + Number(client.nº_pedidos), 0);
        const count = clients.length;
        return count > 0 ? sum / count : 0;
      }),
      tap(averageOrders => console.log('ClientsApiService: Average orders per client:', averageOrders)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    console.error('ClientsApiService Error:', error);
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
