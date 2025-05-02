import { Provider } from '@angular/core';
import { CLIENTS_REPOSITORY } from './domain/tokens/clients-repository.token';
import { ClientsDataRepository } from './data/clients-data-repository';
import { ClientsApiService } from './data/remote/api-json/clients-api.service';
import { ClientsViewModel } from './presentation/main-clients.view-model';
import { GetClientsListUseCase } from './domain/get-clients-list-use-case';
import { GetTotalClientsUseCase } from './domain/get-total-clients-use-case';
import { GetTotalAverageOrdersUseCase } from './domain/get-total-average-orders-use-case';
import { GetAverageTicketUseCase } from './domain/get-average-ticket-use-case';
import { GetClientsPerProductUseCase } from './domain/get-clients-per-product-use-case';
import { GetTotalClientsByYearUseCase } from './domain/get-total-clients-by-year-use-case';
import { GetNewClientsByYearMonthUseCase } from './domain/get-new-clients-by-year-month-use-case';
import { GetAverageOrdersByYearUseCase } from './domain/get-average-orders-by-year-use-case';
import { GetTotalOrdersByYearMonthUseCase } from './domain/get-total-orders-by-year-month-use-case';
import { GetAverageTicketByYearUseCase } from './domain/get-average-ticket-by-year-use-case';
import { GetLTVByYearMonthUseCase } from './domain/get-ltv-by-year-month-use-case';
import { GetTopLocationsByClientsUseCase } from './domain/get-top-locations-by-clients-use-case';

export const clientsProviders: Provider[] = [
  ClientsApiService,
  {
    provide: CLIENTS_REPOSITORY,
    useClass: ClientsDataRepository
  },
  ClientsViewModel,
  GetClientsListUseCase,
  GetTotalClientsUseCase,
  GetTotalAverageOrdersUseCase,
  GetAverageTicketUseCase,
  GetClientsPerProductUseCase,
  GetTotalClientsByYearUseCase,
  GetNewClientsByYearMonthUseCase,
  GetAverageOrdersByYearUseCase,
  GetTotalOrdersByYearMonthUseCase,
  GetAverageTicketByYearUseCase,
  GetLTVByYearMonthUseCase,
  GetTopLocationsByClientsUseCase
];