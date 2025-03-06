import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Invoice } from "../models/invoice.model";
import { InvoiceDataRepositoryService } from "../../data/repositories/invoice-data-repository.service";

@Injectable({
    providedIn: 'root'
})
export class GetInvoicesAllUseCase {
    private repository = inject(InvoiceDataRepositoryService);

    execute(): Observable<Invoice[]> {
        return this.repository.getAllInvoices();
    }
}