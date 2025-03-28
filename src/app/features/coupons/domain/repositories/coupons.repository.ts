import {Observable} from "rxjs";
import {Coupon} from "../models/coupons.models";

export interface CouponsRepository {
  getMostUsedCoupons(): Observable<Coupon[]>;
  getTotalCoupons(): Observable<number>;
  getTotalDiscount(): Observable<number>;
  getTotalCouponsByMonth(month: string, year: string): Observable<number>;
  getTotalDiscountByMonth(month: string, year: string): Observable<number>;
  getMonthlyCouponsByYear(year: string): Observable<number[]>
}
