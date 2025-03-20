import { InjectionToken } from '@angular/core';
import { IClientsRepository } from '../clients-repository.interface';

export const CLIENTS_REPOSITORY = new InjectionToken<IClientsRepository>('CLIENTS_REPOSITORY');