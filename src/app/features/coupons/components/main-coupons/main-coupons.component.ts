import {Component,OnInit,inject} from '@angular/core';
import {Coupon} from '../../domain/models/coupons.models';
import {GetMostUsedCouponsUseCase} from '../../domain/useCases/getMOstUsedCouponsUseCase';
import {CouponsTableComponent} from "../coupons-table/coupons-table.component";

@Component({
  selector: 'app-main-coupons',
  imports: [CouponsTableComponent],
  templateUrl: './main-coupons.component.html',
  styleUrl: './main-coupons.component.css'
})
export class MainCouponsComponent  {

}
