import { OrderInvoiceProductTypeModel } from "../../../../../domain/models/order-invoice-product-type.model";

export class OrderInvoiceProductTypeMapper {
    static toModel(data: any): OrderInvoiceProductTypeModel {
        return new OrderInvoiceProductTypeModel(
            data.id || '',
            data.date || '',
            data.productType || '',
            data.invoiceProductyType || '',
            data.orderProductType || ''
        );
    }

    static toModelList(dataList: any[]): OrderInvoiceProductTypeModel[] {
        if (!Array.isArray(dataList)) {
            console.error("OrderInvoiceProductTypeMapper: dataList no es un array:", dataList);
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}