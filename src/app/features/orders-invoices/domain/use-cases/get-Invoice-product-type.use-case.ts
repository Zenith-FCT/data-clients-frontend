import { Observable } from "rxjs";
import { OrderInvoiceProductTypeRepository } from "../repositories/order-invoice-product-type-repository";
import { OrderInvoiceProductTypeModel } from "../models/order-invoice-product-type.model";

export class GetOrderInvoiceProductTypeUseCase {
    constructor(private orderInvoiceProductTypeRepository: OrderInvoiceProductTypeRepository) {}

    execute(): Observable<OrderInvoiceProductTypeModel[]> {
        return this.orderInvoiceProductTypeRepository.getOrderInvoiceProductType();
    }
}