import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { ClientsListApi } from './clients-list-api.model';
import { ProductClientDistribution } from '../../../domain/product-distribution.model';
import { ClientsApiMapper } from './clients-api.mapper';
import { ProductClientDistributionApi } from './product-client-distribution-api.model';
import { TopLocationsByClientsApi } from './top-locations-by-clients-api.model';
import { TopLocationsByClients } from '../../../domain/top-locations-by-clients.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsApiService {
  private apiUrl = `${environment.apiUrl}/clientes`;
  private pedidosUrl = `${environment.apiUrl}/pedidos`;

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

  getAverageTicket(): Observable<number> {
    return this.getAllClientsList().pipe(
      map(clients => {
        const sum = clients.reduce<number>((acc, client) => acc + Number(client.tm), 0);
        const count = clients.length;
        return count > 0 ? sum / count : 0;
      }),
      tap(averageTicket => console.log('ClientsApiService: Average ticket per client:', averageTicket)),
      catchError(this.handleError)
    );
  }

  getClientsPerProduct(): Observable<ProductClientDistribution[]> {
    // Para el json-server actual, hacemos el procesamiento aquí
    // Cuando se conecte a la API real, esta línea simplemente devolverá los datos directamente
    return this.http.get<any[]>(this.pedidosUrl).pipe(
      map(orders => {
        // Este procesamiento solo es necesario con el json-server
        // y se eliminará cuando consigas la API real
        const categoryClientsMap = new Map<string, Set<string>>();
        
        orders.forEach(order => {
          if (order.productos && Array.isArray(order.productos) && order.email) {
            order.productos.forEach((product: any) => {
              if (product && product.categoria) {
                const categoria = product.categoria.trim();
                
                if (!categoryClientsMap.has(categoria)) {
                  categoryClientsMap.set(categoria, new Set());
                }
                categoryClientsMap.get(categoria)?.add(order.email.toLowerCase().trim());
              }
            });
          }
        });

        // Crear objetos ProductClientDistributionApi a partir del mapa
        const apiDistributions: ProductClientDistributionApi[] = Array.from(categoryClientsMap.entries())
          .map(([name, clients]) => new ProductClientDistributionApi(
            name,
            clients.size
          ));

        // Mapear objetos de API a objetos de dominio
        return ClientsApiMapper.productDistributionListToDomain(apiDistributions);
      }),
      tap(distribution => console.log('ClientsApiService: Clients per category distribution:', distribution)),
      catchError(this.handleError)
    );
  }

  getTopLocationsByClients(): Observable<TopLocationsByClients[]> {
    
  }


  // Nuevos métodos para filtrado por año y mes

  getFullClientData(): Observable<any[]> {
    // Este método obtiene los datos completos de los clientes con todas las fechas y campos
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getFullOrdersData(): Observable<any[]> {
    // Este método obtiene los datos completos de pedidos con todas las fechas y campos
    return this.http.get<any[]>(this.pedidosUrl).pipe(
      catchError(this.handleError)
    );
  }

  getClientsByYear(year: string): Observable<ClientsListApi[]> {
    return this.getFullClientData().pipe(
      map(clients => {
        // Filtrar clientes por año de primer pedido
        return clients.filter(client => {
          // Extraer año de la fecha del primer pedido
          const clientYear = new Date(client.fecha_1er_pedido).getFullYear().toString();
          return clientYear === year;
        });
      }),
      tap(clients => console.log(`ClientsApiService: Clients filtered by year ${year}:`, clients)),
      catchError(this.handleError)
    );
  }

  getTotalClientsByYear(year: string): Observable<number> {
    return this.getClientsByYear(year).pipe(
      map(clients => clients.length),
      tap(total => console.log(`ClientsApiService: Total clients for year ${year}:`, total)),
      catchError(this.handleError)
    );
  }

  getNewClientsByYearMonth(year: string, month: string): Observable<number> {
    return this.getFullClientData().pipe(
      map(clients => {
        // Filtrar clientes por año y mes del primer pedido (en vez de fecha del lead)
        return clients.filter(client => {
          const firstOrderDate = new Date(client.fecha_1er_pedido);
          const orderYear = firstOrderDate.getFullYear().toString();
          // getMonth() devuelve 0-11, necesitamos sumar 1 para que sea 1-12
          const orderMonth = (firstOrderDate.getMonth() + 1).toString();
          return orderYear === year && orderMonth === month;
        }).length;
      }),
      tap(count => console.log(`ClientsApiService: New clients for ${year}/${month}:`, count)),
      catchError(this.handleError)
    );
  }

  getTotalAverageOrdersByYear(year: string): Observable<number> {
    // Primero obtenemos los clientes del año específico
    return this.getClientsByYear(year).pipe(
      map(clients => {
        if (!clients || clients.length === 0) return 0;
        
        // Calculamos el promedio de pedidos para esos clientes
        const sum = clients.reduce<number>((acc, client) => acc + Number(client.nº_pedidos), 0);
        return sum / clients.length;
      }),
      tap(average => console.log(`ClientsApiService: Average orders for year ${year}:`, average)),
      catchError(this.handleError)
    );
  }

  getTotalOrdersByYearMonth(year: string, month: string): Observable<number> {
    return this.getFullOrdersData().pipe(
      map(orders => {
        // Filtrar pedidos por año y mes
        return orders.filter(order => {
          const orderDate = new Date(order.fecha_pedido);
          const orderYear = orderDate.getFullYear().toString();
          // getMonth() devuelve 0-11, necesitamos sumar 1 para que sea 1-12
          const orderMonth = (orderDate.getMonth() + 1).toString();
          return orderYear === year && orderMonth === month;
        }).length;
      }),
      tap(count => console.log(`ClientsApiService: Total orders for ${year}/${month}:`, count)),
      catchError(this.handleError)
    );
  }

  getAverageTicketByYear(year: string): Observable<number> {
    // Obtenemos los pedidos del año específico para calcular el ticket medio
    return this.getFullOrdersData().pipe(
      map(orders => {
        const yearOrders = orders.filter(order => {
          const orderDate = new Date(order.fecha_pedido);
          const orderYear = orderDate.getFullYear().toString();
          return orderYear === year;
        });
        
        if (yearOrders.length === 0) return 0;
        
        // Calculamos el ticket medio de los pedidos del año
        const sum = yearOrders.reduce((acc, order) => acc + Number(order.total_pedido), 0);
        return sum / yearOrders.length;
      }),
      tap(average => console.log(`ClientsApiService: Average ticket for year ${year}:`, average)),
      catchError(this.handleError)
    );
  }

  getLTVByYearMonth(year: string, month: string): Observable<number> {
    // Para LTV vamos a usar datos de clientes y pedidos
    return this.getFullClientData().pipe(
      map(clients => {
        // Filtramos clientes que tuvieron su primer pedido en el año/mes indicado
        const filteredClients = clients.filter(client => {
          const firstOrderDate = new Date(client.fecha_1er_pedido);
          const orderYear = firstOrderDate.getFullYear().toString();
          const orderMonth = (firstOrderDate.getMonth() + 1).toString();
          return orderYear === year && orderMonth === month;
        });
        
        if (filteredClients.length === 0) return 0;
        
        // Calculamos el LTV promedio de estos clientes
        const sum = filteredClients.reduce((acc, client) => acc + Number(client.ltv), 0);
        return sum / filteredClients.length;
      }),
      tap(ltv => console.log(`ClientsApiService: LTV for ${year}/${month}:`, ltv)),
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
