import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IClientsRepository } from './iclients-repository.interface';
import { CLIENTS_REPOSITORY } from './tokens/clients-repository.token';

@Injectable({
    providedIn: 'root'
})
export class GetTotalOrdersByYearMonthUseCase {
    constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

    execute(year: string, month: string): Observable<number> {
        return this.clientsRepository.getTotalOrdersByYearMonth(year, month);
    }
}