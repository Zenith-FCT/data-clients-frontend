import { Observable, from } from "rxjs";
import { ApiService } from "./remote/api/api.service";
import { Injectable } from "@angular/core";
import { OrderInvoiceProductTypeRepository } from "../../domain/repositories/order-invoice-product-type-repository";
import { OrderInvoiceProductTypeModel } from "../../domain/models/order-invoice-product-type.model";

@Injectable({
    providedIn: 'root'
})
export class OrderInvoiceProductTypeDataRepository implements OrderInvoiceProductTypeRepository {
    constructor(private apiService: ApiService) {}

    getOrderInvoiceProductType(): Observable<OrderInvoiceProductTypeModel[]> {
        return from(this.apiService.getOrderInvoiceProductType());
    }

}