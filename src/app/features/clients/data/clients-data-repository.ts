import { Inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class ClientsDataRepository {
    private apiClients = Inject('ClientsApiService');

    getAllClients() {
        return null;
    }
}