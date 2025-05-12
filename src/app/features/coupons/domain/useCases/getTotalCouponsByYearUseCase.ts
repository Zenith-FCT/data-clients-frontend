import {Observable} from "rxjs";
import {map} from 'rxjs/operators';
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetTotalCouponsByYearUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(year: string): Observable<number> {
      return this.couponService.getMonthlyCouponsByYear(year).pipe(
        map((monthlyCoupons: number[]) => monthlyCoupons.reduce((sum, count) => sum + count, 0))
      )
  }

}
