import { Observable, map } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';
import { MonthlySalesModel } from '../models/monthly-sales.model';

export class GetTotalsForAllYearsUseCase {
    constructor(private monthlySalesRepository: MonthlySalesRepository) {}
    
    execute(): Observable<MonthlySalesModel> {
        return this.monthlySalesRepository.getMonthlySales().pipe(
            map((monthlySales: MonthlySalesModel[]) => {
                if (!monthlySales || monthlySales.length === 0) {
                    return new MonthlySalesModel('total', 'total of years', '0', '0');
                }
                
                const totalSales = monthlySales.reduce((total, sale) => {
                    const saleAmount = parseFloat(sale.totalSales) || 0;
                    return total + saleAmount;
                }, 0).toString();
                
                const totalOrders = monthlySales.reduce((total, sale) => {
                    const orderCount = parseInt(sale.totalSalesNumber) || 0;
                    return total + orderCount;
                }, 0).toString();
                
                return new MonthlySalesModel(
                    'total',
                    'total of years',
                    totalSales,
                    totalOrders 
                );
            })
        );
    }
}