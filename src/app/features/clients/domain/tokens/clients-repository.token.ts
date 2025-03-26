import { InjectionToken } from '@angular/core';
import { IClientsRepository } from '../iclients-repository.interface';

export const CLIENTS_REPOSITORY = new InjectionToken<IClientsRepository>('CLIENTS_REPOSITORY');