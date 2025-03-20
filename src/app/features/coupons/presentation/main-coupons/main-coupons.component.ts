import {Component} from '@angular/core';
import {CouponsTableComponent} from "./components/coupons-table/coupons-table.component";

@Component({
  selector: 'app-main-coupons',
  imports: [CouponsTableComponent],
  templateUrl: './main-coupons.component.html',
  styleUrl: './main-coupons.component.css'
})
export class MainCouponsComponent  {

}
