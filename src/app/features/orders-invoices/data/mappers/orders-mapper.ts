import { Pedido } from "../../domain/models/orders-model";

export class OrdersMapper {
    static toModel(data: any): Pedido {
        return new Pedido(
            data.id || '',
            data.numero_pedido || '',
            data.fecha_pedido || '',
            data.nombre_cliente || '',
            data.email || '',
            data.total_pedido || '',
            data.total_descuento || '',
            data.nombre_cupon_descuento || '',
            data.productos || []
        );
    }

    static toModelList(dataList: any[]): Pedido[] {
        if (!Array.isArray(dataList)) {
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}