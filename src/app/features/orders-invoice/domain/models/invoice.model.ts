export interface Invoice {
    id: string;
    invoiceNumber: string;
    dateCreated: Date;
    clientId: string;
    total: number;
    productType: ProductType;
    customerType: CustomerType;
}

export interface BillingStats {
    totalBilling: number;
    monthlyBilling: {
        month: string; // YYYY-MM
        amount: number;
    }[];
    productTypeBilling: {
        master: number;
        course: number;
        membership: number;
    };
    customerTypeBilling: {
        recurring: number;
        oneTime: number;
    };
    averageOrderValue: number;     // Ticket Medio
    averageCustomerValue: number;  // Facturación por cliente
    customerLifetimeValue: number; // LTV
}

export enum ProductType {
    MASTER = 'MASTER',
    COURSE = 'COURSE',
    MEMBERSHIP = 'MEMBERSHIP'
}

export enum CustomerType {
    RECURRING = 'RECURRING',
    ONE_TIME = 'ONE_TIME'
}