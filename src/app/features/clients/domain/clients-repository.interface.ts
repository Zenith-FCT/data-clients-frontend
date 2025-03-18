import { Observable } from "rxjs";
import { Clients } from "./clients.model";

export interface IClientsRepository {
    getAllClients(): Observable<Clients[]>;
}