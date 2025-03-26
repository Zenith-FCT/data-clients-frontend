import {Observable} from "rxjs";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetTotalDiscountCouponsUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(): Observable<number> {
      return this.couponService.getTotalDiscount()
  }

}
