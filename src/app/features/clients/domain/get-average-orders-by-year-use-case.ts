import { Observable } from "rxjs";
import { IClientsRepository } from "./iclients-repository.interface";
import { Inject, Injectable } from "@angular/core";
import { CLIENTS_REPOSITORY } from "./tokens/clients-repository.token";

@Injectable({
    providedIn: 'root'
})
export class GetAverageOrdersByYearUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY) private clientsRepository: IClientsRepository) {}

  execute(year: string): Observable<number> {
    return this.clientsRepository.getTotalAverageOrdersByYear(year);
  }
}