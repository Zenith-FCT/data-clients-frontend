import {Observable} from "rxjs";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetTotalCouponsUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(): Observable<number> {
      return this.couponService.getTotalCoupons()
  }

}
