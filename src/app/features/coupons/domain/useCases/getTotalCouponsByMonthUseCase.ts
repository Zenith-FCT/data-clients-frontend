import {Observable} from "rxjs";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetTotalCouponsByMonthUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(month: string, year: string): Observable<number> {
      return this.couponService.getTotalCouponsByMonth(month, year)
  }

}
