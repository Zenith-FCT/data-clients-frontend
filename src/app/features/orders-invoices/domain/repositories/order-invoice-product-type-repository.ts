import { Observable } from "rxjs";
import { OrderInvoiceProductTypeModel } from "../models/order-invoice-product-type.model";

export interface OrderInvoiceProductTypeRepository {
    getOrderInvoiceProductType(): Observable<OrderInvoiceProductTypeModel[]>;
}