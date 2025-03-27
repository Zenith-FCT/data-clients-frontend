import { Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';
import { IClientsRepository } from './iclients-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class GetAverageTicketUseCase {
  constructor(
    @Inject(CLIENTS_REPOSITORY) private iClientsRepository: IClientsRepository
  ) {}

  execute(): Observable<number> {
    return this.iClientsRepository.getAverageTicket();
  }
}