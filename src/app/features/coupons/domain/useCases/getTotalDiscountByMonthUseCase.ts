import {Observable,map} from "rxjs";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetTotalDiscountByMonthUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(month: string, year: string): Observable<number> {
      return this.couponService.getTotalDiscountByMonth(month, year).pipe(
        map(total => Math.floor(total))
      )
  }

}
