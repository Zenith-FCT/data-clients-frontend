import { Observable, map } from 'rxjs';
import { MonthlySalesRepository } from '../repositories/monthly-sales-repository';
import { MonthlySalesModel } from '../models/monthly-sales.model';

export class GetMonthlySalesUseCase {
    constructor(private monthlySalesRepository: MonthlySalesRepository) {}
    
    execute(year: number, month: number): Observable<number> {
        let monthlySales = this.monthlySalesRepository.getMonthlySales();
        return monthlySales.pipe(
            map((monthlySales: MonthlySalesModel[]) => {
                // El mes ya viene en el formato correcto (1-12)
                const actualMonth = month;
                const formattedMonth = actualMonth < 10 ? `0${actualMonth}` : `${actualMonth}`;
                const searchFormat = `${year}-${formattedMonth}`;
                const monthlySale = monthlySales.find(sale => sale.date === searchFormat);
                
                return monthlySale ? parseFloat(monthlySale.totalSales) : 0;
            })
        );
    }
}