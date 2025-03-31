import { Observable, from } from "rxjs";
import { ApiService } from "./remote/api/api.service";
import { Injectable } from "@angular/core";
import { InvoiceClientsTypeRepository } from "../../domain/repositories/invoice-client-type-repository";
import { InvoiceClientsTypeModel } from "../../domain/models/invoice-clients-type.model";

@Injectable({
    providedIn: 'root'
})
export class InvoiceClientsTypeDataRepository implements InvoiceClientsTypeRepository {
    
    constructor(private apiService: ApiService) {}

    getInvoiceClientType(): Observable<InvoiceClientsTypeModel[]> {
        return from(this.apiService.getInvoiceClientType());
    }
    
}