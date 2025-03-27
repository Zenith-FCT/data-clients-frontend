import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IClientsRepository } from './iclients-repository.interface';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';
import { TopLocationsByClients } from './top-locations-by-clients.model';

@Injectable({
    providedIn: 'root'
})
export class GetTopLocationsByClientsUseCase {
    constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

    execute(locationType: 'country' | 'city'): Observable<TopLocationsByClients[]> {
        return this.clientsRepository.getTopLocationsByClients(locationType);
    }
}