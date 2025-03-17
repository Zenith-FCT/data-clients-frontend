export class Clients {
    constructor(
        public id: string,
        public email: string,
        public name: string,
        public age: number,
        public gender: string,
        public postalCode: string,
        public city: string,
        public country: string,
        public leadDate: Date,
        public firstOrderDate: Date,
        public conversionPeriod: number,
        public lastOrderDate: Date,
        public lifetimeValue: number,
        public leadSource: string,
        public orderCount: number,
        public ltv: number,
        public averageOrderValue: number,
        public averagePurchaseInterval: number,
        public daysSinceLastOrder: number
    ) {}
}