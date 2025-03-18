export class ClientsApi {
    constructor(
        public id: string,
        public email: string,
        public nombre: string,
        public edad: string,
        public sexo: string,
        public cp: string,
        public localidad: string,
        public pais: string,
        public fecha_lead: string,
        public fecha_1er_pedido: string,
        public periodo_conversión: string,
        public fecha_ult_pedido: string,
        public tiempo_ltv: string,
        public entrada_lead: string,
        public nº_pedidos: string,
        public ltv: string,
        public tm: string,
        public periodo_medio_compra: string,
        public periodo_desde_ultimo_pedido: string
    ) { }
}