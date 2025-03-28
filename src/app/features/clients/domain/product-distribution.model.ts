export interface ProductClientDistribution {
  name: string;       // Nombre de la categoría de producto
  value: number;      // Número de clientes únicos
  percentage?: number; // Porcentaje (opcional, calculado en frontend si es necesario)
}