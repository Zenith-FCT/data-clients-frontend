import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientsList } from './clients-list.model';
import { IClientsRepository } from './iclients-repository.interface';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';

@Injectable({
    providedIn: 'root'
})
export class GetClientsListUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

  execute(): Observable<ClientsList[]> {
    return this.clientsRepository.getAllClientsList();
  }
}
