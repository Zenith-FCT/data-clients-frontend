import { Observable, of } from "rxjs";
import { MonthlySalesRepository } from "../repositories/monthly-sales-repository";

export class TmModel {
  constructor(public tm: string, public year: number, public month: number) {}
}

export class GetMonthlyTMUseCase {
  constructor(private monthlySalesRepository: MonthlySalesRepository) {}

  execute(): Observable<TmModel[]> {
    let tmList: TmModel[] = [];
    let monthlySales = this.monthlySalesRepository.getMonthlySales();
    
    monthlySales.forEach((sale: any) => {
      const [yearStr, monthStr] = sale.fecha.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const totalSales = parseFloat(sale.total);
      const totalSalesNumber = parseFloat(sale.total_ventas);
      
      let tm = "0";
      if (totalSalesNumber > 0) {
        tm = (totalSales / totalSalesNumber).toFixed(2);
      }
      
      tmList.push(new TmModel(tm, year, month));
    });
    
    return of(tmList);
  }
}