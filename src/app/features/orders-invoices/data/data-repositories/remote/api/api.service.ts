import { Injectable } from '@angular/core';
import { MonthlySalesModel } from '../../../../domain/models/monthly-sales.model';
import { MonthlySalesMapper } from './mappers/monthly-sales-mapper';

@Injectable({
  providedIn: 'root'
})
export class ApiService{
    
    constructor() { }
    url = 'http://localhost:3000/';

    async getMonthlySales(): Promise<any[]> { 
        try {
            const response = await fetch(`${this.url}monthly_totals`);
            const data = await response.json();
            if(data){
                return MonthlySalesMapper.toModelList(data);
            }
            else{
                return [] as MonthlySalesModel[];
            }
        }
        catch (error) {
            console.error("Error obteniendo ventas mensuales:", error);
            return [];
        }
    }
}