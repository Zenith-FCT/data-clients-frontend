import {Injectable,inject} from "@angular/core";
import {CouponsDataRepository} from "../../data/couponsDataRepository";
import {Coupon} from "../models/coupons.models";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GetMostUsedCouponsUseCase {
  private couponService = inject(CouponsDataRepository)

  execute(): Observable<Coupon[]> {
      return this.couponService.getMostUsedCoupons()
  }

}
