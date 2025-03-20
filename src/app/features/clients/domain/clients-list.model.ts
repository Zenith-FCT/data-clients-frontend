import { ClientsListApi } from "../data/remote/api-json/clients-list-api.model";

export class ClientsList {
    private constructor(
        private readonly _id: string,
        private readonly _email: string,
        private readonly _orderCount: number,
        private readonly _ltv: number,
        private readonly _averageOrderValue: number,
    ) {}

    get id(): string { return this._id; }
    get email(): string { return this._email; }
    get orderCount(): number { return this._orderCount; }
    get ltv(): number { return this._ltv; }
    get averageOrderValue(): number { return this._averageOrderValue; }

    static create(apiModel: any): ClientsList {
        return new ClientsList(
            apiModel.id,
            apiModel.email,
            parseInt(apiModel.nº_pedidos, 10),
            parseFloat(apiModel.ltv),
            parseFloat(apiModel.tm)
        );
    }
}