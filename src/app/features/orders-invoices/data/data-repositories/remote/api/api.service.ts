import { Injectable } from '@angular/core';
import { MonthlySalesModel } from '../../../../domain/models/monthly-sales.model';
import { MonthlySalesMapper } from './mappers/monthly-sales-mapper';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    
    constructor() { }
    url = 'http://localhost:3000/';

    async getMonthlySales(): Promise<MonthlySalesModel[]> { 
        try {
            const response = await fetch(`${this.url}monthly_totals`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && Array.isArray(data)) {
                return MonthlySalesMapper.toModelList(data);
            }
            throw new Error('Datos inválidos recibidos del servidor');
        }
        catch (error) {
            console.error("Error obteniendo ventas mensuales:", error);
            throw error;
        }
    }
}