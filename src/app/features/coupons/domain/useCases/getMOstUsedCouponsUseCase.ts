import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {CouponsDataRepository} from "../../data/couponsDataRepository";
import {Coupon} from "../models/coupons.models";

@Injectable({
  providedIn: 'root'
})
export class GetMostUsedCouponsUseCase {
  constructor(private couponService: CouponsDataRepository) {}

  execute(): Observable<Coupon[]> {
      return this.couponService.getMostUsedCoupons()
  }

}
