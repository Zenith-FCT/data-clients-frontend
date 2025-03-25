import { catchError, Observable, tap } from 'rxjs';
import { ClientsApiService } from '../data/remote/api-json/clients-api.service';
import { Inject, Injectable } from '@angular/core';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';
import { IClientsRepository } from './iclients-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class GetTotalAverageOrdersUseCase {
  constructor(
    @Inject(CLIENTS_REPOSITORY) private iClientsRepository: IClientsRepository
  ) {}

  execute(): Observable<number> {
    return this.iClientsRepository.getTotalAverageOrders();
  }
}
