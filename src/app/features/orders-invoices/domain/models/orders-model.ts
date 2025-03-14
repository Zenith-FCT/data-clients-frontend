class Producto {
    nombre_producto: string;
    sku: string;
    categoria: string;
  
    constructor(nombre_producto: string, sku: string, categoria: string) {
      this.nombre_producto = nombre_producto;
      this.sku = sku;
      this.categoria = categoria;
    }
  }
  
  export class Pedido {
    id: string;
    numero_pedido: string;
    fecha_pedido: string;
    nombre_cliente: string;
    email: string;
    total_pedido: string;
    total_descuento: string;
    nombre_cupon_descuento: string;
    productos: Producto[];
  
    constructor(
      id: string,
      numero_pedido: string,
      fecha_pedido: string,
      nombre_cliente: string,
      email: string,
      total_pedido: string,
      total_descuento: string,
      nombre_cupon_descuento: string,
      productos: Producto[]
    ) {
      this.id = id;
      this.numero_pedido = numero_pedido;
      this.fecha_pedido = fecha_pedido;
      this.nombre_cliente = nombre_cliente;
      this.email = email;
      this.total_pedido = total_pedido;
      this.total_descuento = total_descuento;
      this.nombre_cupon_descuento = nombre_cupon_descuento;
      this.productos = productos;
    }
  }