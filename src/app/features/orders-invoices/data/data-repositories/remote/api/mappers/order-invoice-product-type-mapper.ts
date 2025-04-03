import { OrderInvoiceProductTypeModel } from "../../../../../domain/models/order-invoice-product-type.model";

export class OrderInvoiceProductTypeMapper {
    static toModel(data: any): OrderInvoiceProductTypeModel {
        const invoiceProductType = data.invoiceProductType || data.invoice_product_type || '0';
        const numericValue = parseFloat(invoiceProductType);
        
        return new OrderInvoiceProductTypeModel(
            data.id || '',
            data.date || '',
            data.productType || data.product_type || '',
            isNaN(numericValue) ? '0' : numericValue.toString(),
            data.orderProductType || data.order_product_type || ''
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