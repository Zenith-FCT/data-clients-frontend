import { Observable } from "rxjs";
import { Order } from "../models/orders-model";
import { MonthlySalesModel } from "../models/monthly-sales.model";

export abstract class MonthlySalesRepository {
    abstract getMonthlySales(): Observable<MonthlySalesModel[]>;
}