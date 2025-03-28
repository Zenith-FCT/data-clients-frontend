import { Observable, map } from "rxjs";
import { MonthlySalesRepository } from "../repositories/monthly-sales-repository";
import { MonthlySalesModel } from "../models/monthly-sales.model";

export class GetMonthlyTmUseCase {
    constructor(private monthlySalesRepository: MonthlySalesRepository) {}

    execute(year: number, month: number): Observable<number> {
        return this.monthlySalesRepository.getMonthlySales().pipe(
            map((salesData: MonthlySalesModel[]) => {
                const actualMonth = month;
                const formattedMonth = actualMonth < 10 ? `0${actualMonth}` : `${actualMonth}`;
                const searchFormat = `${year}-${formattedMonth}`;
                
                const monthlySale = salesData.find(sale => {
                    return sale.date === searchFormat;
                });
                
                if (monthlySale) {
                    return parseFloat(monthlySale.totalSales) / parseFloat(monthlySale.totalSalesNumber);
                }
                return 0;
            })
        );
    }
}