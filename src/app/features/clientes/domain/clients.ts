export interface Client {
    email: string;
    pais: string;
    fecha_lead: Date;
    fecha_primer_pedido: Date;
    fecha_ultimo_pedido: Date;
    intervalo_lead_pedido: number; // días entre lead y primer pedido
    intervalo_vida_pedidos: number; // días entre primer y último pedido
    cantidad_pedidos: number;
    importe_total: number;
    importe_medio: number;
    lead_magnet_entrada: string;
    productos_pedidos: string[];
  }
