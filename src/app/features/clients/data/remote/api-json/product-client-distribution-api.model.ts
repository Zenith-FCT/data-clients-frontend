// filepath: c:\Users\ruben\Desktop\Desarrollo web\Angular\data-clients-frontend\src\app\features\clients\data\remote\api-json\product-client-distribution-api.model.ts
export class ProductClientDistributionApi {
    constructor(
        public name: string,     // Nombre de la categoría de producto
        public value: number,    // Número de clientes únicos
        public percentage?: number // Porcentaje (opcional, podría incluirse en la respuesta de la API)
    ) { }
}