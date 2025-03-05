export interface OrderInvoice {
    id: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    date: Date;
    dueDate: Date;
    items: InvoiceItem[];
    total: number;
    status: InvoiceStatus;
}

export interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export enum InvoiceStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}