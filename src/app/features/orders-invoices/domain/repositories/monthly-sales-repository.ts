import { Observable } from "rxjs";
import { MonthlySalesModel } from "../models/monthly-sales.model";

export interface MonthlySalesRepository {
    getMonthlySales(): Observable<MonthlySalesModel[]>;
}