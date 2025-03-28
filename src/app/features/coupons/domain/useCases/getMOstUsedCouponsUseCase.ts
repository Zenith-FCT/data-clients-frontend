import {Observable} from "rxjs";
import {Coupon} from "../models/coupons.models";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetMostUsedCouponsUseCase {

  constructor(private couponService :CouponsRepository) {}


  execute(): Observable<Coupon[]> {
      return this.couponService.getMostUsedCoupons()
  }

}
