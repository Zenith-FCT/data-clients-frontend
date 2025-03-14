import { clientes } from '../../domain/models/clients-model';

export class ClientMapper {

  static toModel(data: any): clientes {
    return new clientes(
      data.id || '',
      data.email || '',
      data.nombre || '',
      data.edad?.toString() || '',
      data.sexo || '',
      data.cp?.toString() || '',
      data.localidad || '',
      data.pais || '',
      data.fecha_lead || '',
      data.fecha_1er_pedido || '',
      data.periodo_conversion?.toString() || '',
      data.fecha_ult_pedido || '',
      data.tiempo_ltv?.toString() || '',
      data.entrada_lead || '',
      data.nº_pedidos?.toString() || data.n_pedidos?.toString() || '',
      data.ltv?.toString() || '',
      data.tm?.toString() || '',
      data.periodo_medio_compra?.toString() || '',
      data.periodo_desde_ultimo_pedido?.toString() || ''
    );
  }

  static toModelList(dataList: any[]): clientes[] {
    if (!Array.isArray(dataList)) {
      return [];
    }
    return dataList.map(data => this.toModel(data));
  }
}