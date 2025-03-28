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
    }

    getAllClientsList(): Observable<ClientsList[]> {
        return this.apiClients.getAllClientsList().pipe(
            map((apiClients: any[]) => apiClients.map(client => ClientsApiMapper.toDomain(client))),
            catchError(error => {
                throw error;
            })
        );
    }
}