import { Inject, Injectable } from "@angular/core";
import { Observable, catchError, tap, map } from "rxjs";
import { ClientsList } from "../domain/clients-list.model";
import { IClientsRepository } from "../domain/clients-repository.interface";
import { ClientsApiMapper } from "./remote/api-json/clients-api.mapper";
import { ClientsApiService } from "./remote/api-json/clients-api.service";

@Injectable({
    providedIn: 'root'
})
export class ClientsDataRepository implements IClientsRepository {
    constructor(private apiClients: ClientsApiService) {
        console.log('ClientsDataRepository initialized');
    }

    getAllClientsList(): Observable<ClientsList[]> {
        console.log('ClientsDataRepository: Getting all clients');
        return this.apiClients.getAllClientsList().pipe(
            tap(apiClients => console.log('ClientsDataRepository: Mapping clients:', apiClients)),
            map((apiClients: any[]) => apiClients.map(client => ClientsApiMapper.toDomain(client))),
            catchError(error => {
                console.error('ClientsDataRepository: Error getting clients:', error);
                throw error;
            })
        );
    }
}