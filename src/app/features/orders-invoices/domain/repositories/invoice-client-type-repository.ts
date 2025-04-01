import { Observable } from "rxjs";
import { InvoiceClientsTypeModel } from "../models/invoice-clients-type.model";

export interface InvoiceClientsTypeRepository {
    getInvoiceClientType(): Observable<InvoiceClientsTypeModel[]>;
}