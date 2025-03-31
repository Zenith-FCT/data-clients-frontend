import { Observable } from "rxjs";
import { IClientsRepository } from "./iclients-repository.interface";
import { Inject, Injectable } from "@angular/core";
import { CLIENTS_REPOSITORY } from "./tokens/clients-repository.token";

@Injectable({
    providedIn: 'root'
})
export class GetNewClientsByYearMonthUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

  execute(year: string, month: string): Observable<number> {
    return this.clientsRepository.getNewClientsByYearMonth(year, month);
  }
}