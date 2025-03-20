import { Observable } from "rxjs";
import { ClientsList } from "./clients-list.model";

export interface IClientsRepository {
    getAllClientsList(): Observable<ClientsList[]>;
}