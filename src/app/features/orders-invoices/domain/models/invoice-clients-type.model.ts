export class InvoiceClientsTypeModel {
    constructor(
        public id: string,
        public date: string,
        public recurent: string,
        public unique: string,
        public totalRecurrentOrders: string,
        public totalUniqueOrders: string
    ) {}
}