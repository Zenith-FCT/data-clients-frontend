export class CartModel {
    constructor(
        public id: string,
        public date: string,
        public total: string,
    ) {}
}

export class TotalOrders {
    constructor(
        public total: number,
        public date: string,
    ) {}
}

export class CartsAbandonedRate {
    constructor(
        public date: string,
        public rate: number
    ) {}
}