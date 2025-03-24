import {Observable} from "rxjs";
import {Coupon} from "../models/coupons.models";

export interface CouponsRepository {
  getMostUsedCoupons(): Observable<Coupon[]>;
  getTotalCoupons(): Observable<number>;
  getTotalDiscount(): Observable<number>;
}
