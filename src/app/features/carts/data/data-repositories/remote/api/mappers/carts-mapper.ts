import { CartModel } from "../../../../../domain/models/carts.model";

export class CartsMapper {
    static toModel(data: any): CartModel {
        const id = data.id || data._id || '';
        const date = data.fecha || data.date || '';
        const email = data.email || data.email || '';
        return new CartModel(
            id,
            date,
            email
        );
    }

    static toModelList(dataList: any[]): CartModel[] {
        if (!Array.isArray(dataList)) {
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}