import {Component} from '@angular/core';
import {CouponsTableComponent} from "./components/coupons-table/coupons-table.component";
import { CouponBoxComponent } from "./components/coupon-box/coupon-box.component";
import { CouponCountGraphicComponent } from "./components/coupon-count-graphic/coupon-count-graphic.component";

@Component({
  selector: 'app-main-coupons',
  imports: [CouponsTableComponent, CouponBoxComponent, CouponCountGraphicComponent],
  templateUrl: './main-coupons.component.html',
  styleUrl: './main-coupons.component.css'
})
export class MainCouponsComponent  {

}
