import { Observable } from "rxjs";
import { ClientsList } from "./clients-list.model";
import { ProductClientDistribution } from "./product-distribution.model";
import { TopLocationsByClients } from "./top-locations-by-clients.model";

export interface IClientsRepository {
    getAllClientsList(): Observable<ClientsList[]>;
    getTotalClients(): Observable<number>;
    getTotalAverageOrders(): Observable<number>;
    getAverageTicket(): Observable<number>;
    getClientsPerProduct(): Observable<ProductClientDistribution[]>;
    getTopLocationsByClients(locationType: 'country' | 'city'): Observable<TopLocationsByClients[]>;

    // Nuevos métodos para filtrado
    getClientsByYear(year: string): Observable<ClientsList[]>;
    getTotalClientsByYear(year: string): Observable<number>;
    getNewClientsByYearMonth(year: string, month: string): Observable<number>;
    getTotalAverageOrdersByYear(year: string): Observable<number>;
    getTotalOrdersByYearMonth(year: string, month: string): Observable<number>;
    getAverageTicketByYear(year: string): Observable<number>;
    getLTVByYearMonth(year: string, month: string): Observable<number>;
}