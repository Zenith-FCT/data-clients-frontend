import {Observable} from "rxjs";
import {map} from 'rxjs/operators';
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetTotalDiscountByYearUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(year: string): Observable<number> {
      return this.couponService.getMonthlyDiscountByYear(year).pipe(
        map((monthlyCoupons: number[]) => monthlyCoupons.reduce((sum, count) => sum + count, 0))
      )
  }

}
