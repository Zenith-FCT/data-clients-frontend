import { Observable, map, catchError, of } from "rxjs";
import { MonthlySalesRepository } from "../repositories/monthly-sales-repository";

export class GetTmYearUseCase {

    constructor(private monthlySalesRepository: MonthlySalesRepository) {}

    execute(year: number): Observable<number> {
        return this.monthlySalesRepository.getOrders().pipe(
            map(tm => {
                if (!tm || tm.length === 0) {
                    return 0;
                }
                
                const filteredTm = tm.filter(item => {
                    const itemYear = new Date(item.date).getFullYear();
                    return itemYear === year;
                });
                
                if (filteredTm.length === 0) {
                    return 0;
                }
                
                let totalSalesAmount = 0;
                let totalSalesNumber = 0;
                
                filteredTm.forEach(item => {
                    const salesAmount = parseFloat(item.totalSales) || 0;
                    totalSalesAmount += salesAmount;
                    
                    const salesNumber = parseInt(item.totalSalesNumber) || 0;
                    totalSalesNumber += salesNumber;
                });
                
                if (totalSalesNumber === 0) {
                    return 0;
                }
                
                return totalSalesAmount / totalSalesNumber;
            }),
            catchError(error => {
                console.error('Error al obtener el ticket medio por año en el caso de uso:', error);
                return of(0);
            })
        );
    }
}