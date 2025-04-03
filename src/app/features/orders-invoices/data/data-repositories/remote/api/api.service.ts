import { Injectable } from '@angular/core';
import { MonthlySalesModel } from '../../../../domain/models/monthly-sales.model';
import { MonthlySalesMapper } from './mappers/monthly-sales-mapper';
import { InvoiceClientsTypeMapper } from './mappers/invoice-clients-type-mapper';
import { InvoiceClientsTypeModel } from '../../../../domain/models/invoice-clients-type.model';
import { OrderInvoiceProductTypeMapper } from './mappers/order-invoice-product-type-mapper';
import { LtvMapper } from './mappers/ltv-mapper';

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
            throw error;
        }
    }
    async getInvoiceClientType(): Promise<InvoiceClientsTypeModel[]> {
        try {
            const response = await fetch(`${this.url}clients_type_totals`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                const mappedData = InvoiceClientsTypeMapper.toModelList(data);
                return mappedData;
            }
            
            throw new Error('Datos inválidos recibidos del servidor');
        } catch (error) {
            
            return [];
        } 
    }

    async getOrderInvoiceProductType(): Promise<any[]> {
        try {
            const response = await fetch(`${this.url}order_invoice_product_type`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                const mappedData = OrderInvoiceProductTypeMapper.toModelList(data);
                return mappedData;
            }
            
            throw new Error('Datos inválidos recibidos del servidor');
        } catch (error) {
            return [];
        }
    }

    async getLtv(): Promise<any[]> {
        try{
            const response = await fetch(`${this.url}ltv`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && Array.isArray(data)) {
                const mappedData = LtvMapper.toModelList(data);
                return mappedData;
            }
            throw new Error('Datos inválidos recibidos del servidor');
        }catch(error){
            return [];
        }
    
    }

}