import { carritosAbandonadosModel } from "../../domain/models/carts-model";

export class CartsMapper {
    static toModel(data: any): carritosAbandonadosModel {
        return new carritosAbandonadosModel(
            data.id || '',
            data.fecha || '',
            data.email || ''
        );
    }

    static toModelList(dataList: any[]): carritosAbandonadosModel[] {
        if (!Array.isArray(dataList)) {
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}