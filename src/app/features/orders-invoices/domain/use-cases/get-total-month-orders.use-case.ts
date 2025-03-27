import { Observable, map } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';
import { MonthlySalesModel } from '../models/monthly-sales.model';

export class GetTotalMonthOrdersUseCase {
    constructor(private monthlySalesRepository: MonthlySalesRepository) {}
    
    execute(year: number, month: number): Observable<number> {
        let monthlySales = this.monthlySalesRepository.getMonthlySales();
        return monthlySales.pipe(
            map((monthlySales: MonthlySalesModel[]) => {
                const monthNumber = month + 1;
                const formattedMonth = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
                const searchFormat = `${year}-${formattedMonth}`;
                const monthlySale = monthlySales.find(sale => sale.date === searchFormat);
                
                return monthlySale ? parseFloat(monthlySale.totalSalesNumber) : 0;
            })
        );
    }
}