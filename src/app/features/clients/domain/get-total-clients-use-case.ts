import { Observable } from "rxjs";
import { IClientsRepository } from "./iclients-repository.interface";
import { Inject, Injectable } from "@angular/core";
import { CLIENTS_REPOSITORY } from "./tokens/clients-repository.token";


@Injectable({
    providedIn: 'root'
})
export class GetTotalClientsUseCase {
  constructor(@Inject(CLIENTS_REPOSITORY)  private clientsRepository: IClientsRepository) {}

  execute(): Observable<number> {
    return this.clientsRepository.getTotalClients();
  }
}