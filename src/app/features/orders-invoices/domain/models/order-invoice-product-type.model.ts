export class OrderInvoiceProductTypeModel {
  constructor(
    public id: string,
    public date: string,
    public productType: string,
    public invoiceProductType: string,
    public orderProductType: string
  ) {}
}