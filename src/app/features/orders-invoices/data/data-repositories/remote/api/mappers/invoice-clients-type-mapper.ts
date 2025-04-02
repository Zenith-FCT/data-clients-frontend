import { InvoiceClientsTypeModel } from "../../../../../domain/models/invoice-clients-type.model";

export class InvoiceClientsTypeMapper {
    static toModel(data: any): InvoiceClientsTypeModel {
        const id = data.id || data._id || '';
        const date = data.fecha || data.date || '';
        const recurent = data.recurrente || data.total_recurrente || '';
        const unique = data.unico || data.total_unique ||  '';
        const totalRecurrentSales = data.total_orders_recurrent || '';
        const totalUniqueSales = data.total_unique_orders || '';
        
        return new InvoiceClientsTypeModel(
            id,
            date,
            recurent,
            unique,
            totalRecurrentSales,
            totalUniqueSales
        );
    }

    static toModelList(dataList: any[]): InvoiceClientsTypeModel[] {
        if (!Array.isArray(dataList)) {
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}