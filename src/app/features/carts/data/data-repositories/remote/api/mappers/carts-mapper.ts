import { CartModel, TotalOrders } from "../../../../../domain/models/carts.model";

export class CartsMapper {
    static toModel(data: any): CartModel {
        const id = data.id || data._id || '';
        const date = data.fecha || data.date || '';
        const total = data.total ? data.total.toString() : '0';
        return new CartModel(
            id,
            date,
            total
        );
    }

    static toModelList(dataList: any[]): CartModel[] {
        if (!Array.isArray(dataList)) {
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}

export class TotalOrdersMapper {
    static toModel(data: any): TotalOrders {
        const total = typeof data.total === 'number' ? data.total : parseFloat(data.total) || 0;
        const date = data.fecha || data.date || '';
        return new TotalOrders(
            total,
            date,
        );
    }

    static toModelList(dataList: any[]): TotalOrders[] {
        if (!Array.isArray(dataList)) {
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}