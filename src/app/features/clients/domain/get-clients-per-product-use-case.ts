import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IClientsRepository } from './iclients-repository.interface';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';
import { ProductClientDistribution } from './product-distribution.model';

@Injectable({
    providedIn: 'root'
})
export class GetClientsPerProductUseCase {
    constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

    execute(): Observable<ProductClientDistribution[]> {
        return this.clientsRepository.getClientsPerProduct();
    }
}