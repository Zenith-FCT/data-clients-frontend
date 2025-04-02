import { Observable } from 'rxjs';
import { InvoiceClientsTypeRepository } from '../repositories/invoice-client-type-repository';
import { InvoiceClientsTypeModel } from '../models/invoice-clients-type.model';

export class GetOrdersByClientsMonthlyUseCase {
    constructor(private invoiceClientsTypeRepository: InvoiceClientsTypeRepository) {}
    
    execute(): Observable<InvoiceClientsTypeModel[]> {
        return this.invoiceClientsTypeRepository.getInvoiceClientType();
    }
}