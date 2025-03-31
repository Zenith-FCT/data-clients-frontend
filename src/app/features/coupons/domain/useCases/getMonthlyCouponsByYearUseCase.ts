import {Observable} from "rxjs";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetMonthlyCouponsByYearUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(year: string): Observable<number[]> {
      return this.couponService.getMonthlyCouponsByYear(year)
  }

}
