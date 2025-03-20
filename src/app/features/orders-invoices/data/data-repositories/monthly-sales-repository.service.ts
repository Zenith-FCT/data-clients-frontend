import { Observable, from } from "rxjs";
import { ApiService } from "./remote/api/api.service";
import { Injectable } from "@angular/core";
import { MonthlySalesRepository } from "../../domain/repositories/monthly-sales-repository";
import { MonthlySalesModel } from "../../domain/models/monthly-sales.model";

@Injectable({
    providedIn: 'root'
})
export class MonthlySalesDataRepository extends MonthlySalesRepository {
    
    constructor(private apiService: ApiService) {
        super();
    }

    override getMonthlySales(): Observable<MonthlySalesModel[]> {
        return from(this.apiService.getMonthlySales());
    }
    override getOrders(): Observable<MonthlySalesModel[]> {
        return from(this.apiService.getMonthlySales());
    }

}