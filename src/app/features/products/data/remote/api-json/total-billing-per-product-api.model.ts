export class TotalBillingPerProductApi {
    constructor(
        public id: string,
        public nombre: string,      // También podríamos manejar 'name' si cambia la API
        public facturacionTotal: number,  // También podríamos manejar 'totalBilling' si cambia la API
        public categoria?: string  // Campo opcional para categoría de producto
    ) {}
}
