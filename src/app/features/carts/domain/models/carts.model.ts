export class CartModel {
    constructor(
        public id: string,
        public date: string,
        public total: string,
    ) {}
}
export class TotalOrders{
    constructor(
        public total: number,
        public date: string,
    ) {}
}