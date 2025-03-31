import { Observable, map } from "rxjs";
import { MonthlySalesRepository } from "../repositories/monthly-sales-repository";
import { MonthlySalesModel } from "../models/monthly-sales.model";

export class TmModel {
  constructor(public tm: string, public year: number, public month: number) {}
}

export class GetAllMonthlyTMUseCase {
  constructor(private monthlySalesRepository: MonthlySalesRepository) {}

  execute(): Observable<TmModel[]> {
    return this.monthlySalesRepository.getMonthlySales().pipe(
      map((salesData: MonthlySalesModel[]) => {
        const tmList: TmModel[] = [];
        
        salesData.forEach((sale: MonthlySalesModel) => {
          const [yearStr, monthStr] = sale.date.split('-');
          const year = parseInt(yearStr);
          const month = parseInt(monthStr);
          
          const totalSales = parseFloat(sale.totalSales);
          const totalSalesNumber = parseFloat(sale.totalSalesNumber);
          
          let tm = "0";
          if (totalSalesNumber > 0) {
            tm = (totalSales / totalSalesNumber).toFixed(2);
          }
          
          tmList.push(new TmModel(tm, year, month));
        });
        
        return tmList;
      })
    );
  }
}