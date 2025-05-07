import { Observable, map } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';
import { MonthlySalesModel } from '../models/monthly-sales.model';

export class GetTmForAllYearsUseCase {
  constructor(private monthlySalesRepository: MonthlySalesRepository) {}

  execute(): Observable<number> {
    return this.monthlySalesRepository.getMonthlySales().pipe(
      map((monthlySales: MonthlySalesModel[]) => {
        let totalSales = 0;
        let totalSalesNumber = 0;
        
        monthlySales.forEach(monthData => {
          totalSales += parseFloat(monthData.totalSales) || 0;
          totalSalesNumber += parseFloat(monthData.totalSalesNumber) || 0;
        });
        
        if (totalSalesNumber === 0) {
          return 0;
        }
        
        return totalSales / totalSalesNumber;
      })
    );
  }
}