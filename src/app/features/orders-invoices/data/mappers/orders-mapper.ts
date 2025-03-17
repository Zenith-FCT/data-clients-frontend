import { Order } from "../../domain/models/orders-model";

export class OrdersMapper {
    static toModel(data: any): Order {
        return new Order(
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

    static toModelList(dataList: any[]): Order[] {
        if (!Array.isArray(dataList)) {
            console.error("OrdersMapper: dataList no es un array:", dataList);
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}