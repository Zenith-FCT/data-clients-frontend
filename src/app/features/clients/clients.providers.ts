import { Provider } from '@angular/core';
import { CLIENTS_REPOSITORY } from './domain/tokens/clients-repository.token';
import { ClientsDataRepository } from './data/clients-data-repository';
import { ClientsApiService } from './data/remote/api-json/clients-api.service';

export const clientsProviders: Provider[] = [
  ClientsApiService,
  {
    provide: CLIENTS_REPOSITORY,
    useClass: ClientsDataRepository
  }
];