import { Observable } from "rxjs";
import { ClientsList } from "./clients-list.model";

export interface IClientsRepository {
    getAllClientsList(): Observable<ClientsList[]>;
    getTotalClients(): Observable<number>;
    getTotalAverageOrders(): Observable<number>;
    getAverageTicket(): Observable<number>;
}