import { Inject, Injectable } from "@angular/core";
import { Observable, catchError, tap, map } from "rxjs";
import { ClientsList } from "../domain/clients-list.model";
import { IClientsRepository } from "../domain/iclients-repository.interface";
import { ProductClientDistribution } from "../domain/product-distribution.model";
import { TopLocationsByClients } from "../domain/top-locations-by-clients.model";
import { ClientsApiMapper } from "./remote/api-json/clients-api.mapper";
import { ClientsApiService } from "./remote/api-json/clients-api.service";

@Injectable({
    providedIn: 'root'
})
export class ClientsDataRepository implements IClientsRepository {
    constructor(private apiClients: ClientsApiService) {
    }

    getAllClientsList(): Observable<ClientsList[]> {
        return this.apiClients.getAllClientsList().pipe(
            map((apiClients: any[]) => apiClients.map(client => ClientsApiMapper.toDomain(client))),
            catchError(error => {
                throw error;
            })
        );
    }

    getTotalClients(): Observable<number> {
        return this.apiClients.getTotalClients().pipe(
            tap(total => console.log('ClientsDataRepository: Total clients:', total)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting total clients:', error);
                throw error;
            })
        );
    }

    getTotalAverageOrders(): Observable<number> {
        return this.apiClients.getTotalAverageOrders().pipe(
            tap(total => console.log('ClientsDataRepository: Total average orders:', total)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting total average orders:', error);
                throw error;
            })
        );
    }

    getAverageTicket(): Observable<number> {
        return this.apiClients.getAverageTicket().pipe(
            tap(average => console.log('ClientsDataRepository: Average ticket per client:', average)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting average ticket:', error);
                throw error;
            })
        );
    }

    getClientsPerProduct(): Observable<ProductClientDistribution[]> {
        return this.apiClients.getClientsPerProduct().pipe(
            tap(distribution => console.log('ClientsDataRepository: Clients per product distribution:', distribution)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting clients per product:', error);
                throw error;
            })
        );
    } 
    getClientsByYear(year: string): Observable<ClientsList[]> {
        return this.apiClients.getClientsByYear(year).pipe(
            map((apiClients: any[]) => apiClients.map(client => ClientsApiMapper.toDomain(client))),
            tap(clients => console.log(`ClientsDataRepository: Clients filtered by year ${year}:`, clients)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting clients by year:', error);
                throw error;
            })
        );
    }

    getTotalClientsByYear(year: string): Observable<number> {
        return this.apiClients.getTotalClientsByYear(year).pipe(
            tap(total => console.log(`ClientsDataRepository: Total clients for year ${year}:`, total)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting total clients by year:', error);
                throw error;
            })
        );
    }

    getNewClientsByYearMonth(year: string, month: string): Observable<number> {
        return this.apiClients.getNewClientsByYearMonth(year, month).pipe(
            tap(newClients => console.log(`ClientsDataRepository: New clients for ${year}/${month}:`, newClients)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting new clients by year/month:', error);
                throw error;
            })
        );
    }

    getTotalAverageOrdersByYear(year: string): Observable<number> {
        return this.apiClients.getTotalAverageOrdersByYear(year).pipe(
            tap(average => console.log(`ClientsDataRepository: Average orders for year ${year}:`, average)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting average orders by year:', error);
                throw error;
            })
        );
    }

    getTotalOrdersByYearMonth(year: string, month: string): Observable<number> {
        return this.apiClients.getTotalOrdersByYearMonth(year, month).pipe(
            tap(totalOrders => console.log(`ClientsDataRepository: Total orders for ${year}/${month}:`, totalOrders)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting total orders by year/month:', error);
                throw error;
            })
        );
    }

    getAverageTicketByYear(year: string): Observable<number> {
        return this.apiClients.getAverageTicketByYear(year).pipe(
            tap(average => console.log(`ClientsDataRepository: Average ticket for year ${year}:`, average)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting average ticket by year:', error);
                throw error;
            })
        );
    }

    getLTVByYearMonth(year: string, month: string): Observable<number> {
        return this.apiClients.getLTVByYearMonth(year, month).pipe(
            tap(ltv => console.log(`ClientsDataRepository: LTV for ${year}/${month}:`, ltv)),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting LTV by year/month:', error);
                throw error;
            })
        );
    }

    getTopLocationsByClients(locationType: 'country' | 'city'): Observable<TopLocationsByClients[]> {
        return this.apiClients.getTopLocationsByClients(locationType).pipe(
            tap(locations => console.log(`ClientsDataRepository: Top ${locationType} locations:`, locations)),
            catchError(error => {
                console.error(`ClientsDataRepository: Error getting top ${locationType} locations:`, error);
                throw error;
            })
        );
    }
}