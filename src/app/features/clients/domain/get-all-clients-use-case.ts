import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Clients } from './clients.model';
import { IClientsRepository } from './clients-repository.interface';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';

@Injectable({
    providedIn: 'root'
})
export class GetAllClientsUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

  execute(): Observable<Clients[]> {
    return this.clientsRepository.getAllClients();
  }
}
