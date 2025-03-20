import { Observable } from "rxjs";
import { MonthlySalesModel } from "../models/monthly-sales.model";

export abstract class MonthlySalesRepository {
    abstract getMonthlySales(): Observable<MonthlySalesModel[]>;
    abstract getOrders(): Observable<MonthlySalesModel[]>;
}