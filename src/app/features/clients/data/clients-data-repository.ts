import { Inject, Injectable } from "@angular/core";
import { Observable, catchError, tap, map } from "rxjs";
import { ClientsList } from "../domain/clients-list.model";
import { IClientsRepository } from "../domain/iclients-repository.interface";
import { ProductClientDistribution } from "../domain/product-distribution.model";
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
}