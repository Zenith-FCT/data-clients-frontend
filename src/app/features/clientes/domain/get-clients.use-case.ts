import { Injectable } from '@angular/core';
import { Client } from './clients';
import { ClientesService } from '../data/clients.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable(
    {providedIn: 'root'}
)

export class GetClientsUseCase {

  clientsService = inject(ClientesService);

  constructor() {}

  execute(): Observable<Client[]> {
    return this.clientsService.getClients();
  }
}