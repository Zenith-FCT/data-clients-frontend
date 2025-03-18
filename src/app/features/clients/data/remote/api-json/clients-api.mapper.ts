import { Clients } from "../../../domain/clients.model";

export class ClientsApiMapper {
    static toDomain(apiClient: any): Clients {
        return new Clients(
            apiClient.id,
            apiClient.email,
            apiClient.nombre,
            parseInt(apiClient.edad),
            apiClient.sexo,
            apiClient.cp,
            apiClient.localidad,
            apiClient.pais,
            new Date(apiClient.fecha_lead),
            new Date(apiClient.fecha_1er_pedido),
            parseInt(apiClient.periodo_conversión),
            new Date(apiClient.fecha_ult_pedido),
            parseInt(apiClient.tiempo_ltv),
            apiClient.entrada_lead,
            parseInt(apiClient.nº_pedidos),
            parseFloat(apiClient.ltv),
            parseFloat(apiClient.tm),
            parseFloat(apiClient.periodo_medio_compra),
            parseInt(apiClient.periodo_desde_ultimo_pedido)
        );
    }
}