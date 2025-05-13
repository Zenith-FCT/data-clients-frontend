import {CommonModule} from '@angular/common';
import {Component,effect,inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {CouponBoxComponent} from "./components/coupon-box/coupon-box.component";
import {BoxCouponsViewModel} from './components/coupon-box/coupons-box.view-model';
import {CouponCountGraphicComponent} from "./components/coupon-count-graphic/coupon-count-graphic.component";
import {CouponCountGraphicViewModel} from './components/coupon-count-graphic/coupon-count-graphic.view-model';
import {CouponsTableComponent} from "./components/coupons-table/coupons-table.component";
import {MainCouponsViewModel} from './main-coupons.viewModel';

@Component({
  selector: 'app-main-coupons',
  imports: [
    CommonModule,
    CouponsTableComponent,
    CouponBoxComponent,
    CouponCountGraphicComponent,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './main-coupons.component.html',
  styleUrl: './main-coupons.component.scss'
})
export class MainCouponsComponent  {
  selectedMonth: number | string = new Date().getMonth() + 1;
  selectedYear: string = new Date().getFullYear().toString();
  lastSelectedYear: string = this.selectedYear;
  years: string[] = [];
  months: number[] = Array.from({length: 12}, (_, i) => i + 1);

  viewModel = inject(MainCouponsViewModel)
  boxViewModel = inject(BoxCouponsViewModel)
  countGraphicViewModel = inject(CouponCountGraphicViewModel)

  constructor() {
    this.viewModel.getYearsAvailable()
    effect(() => {
      this.years = this.viewModel.years()
    });
    this.onDateChange()
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

  onDateChange(): void {

    this.changeBoxTotals()
    this.changeBox()

    if (this.selectedYear.toString() != "0") {
      this.countGraphicViewModel.getTotalCoupons(this.selectedYear)
    }
  }

  changeBoxTotals(): void {
    if (this.selectedYear.toString() == "0") {
      this.boxViewModel.getTotalCoupons()
      this.boxViewModel.getTotalDiscount()
    } else {
      this.boxViewModel.getTotalCouponsByYear(this.selectedYear.toString())
      this.boxViewModel.getTotalDiscountByYear(this.selectedYear.toString())
    }
  }

  changeBox():void {
    var year = this.selectedYear.toString()
    if(year == "0") {
      year = this.lastSelectedYear.toString()
      this.boxViewModel.changeDate(this.selectedMonth.toString(), year, true)
    } else {
      this.lastSelectedYear = this.selectedYear
      this.boxViewModel.changeDate(this.selectedMonth.toString(), year, false)
    }

    if (this.selectedMonth.toString() == "0") {
      this.boxViewModel.getCouponsByYear(year)
      this.boxViewModel.getDiscountByYear(year)

    } else {
      const monthString = this.selectedMonth.toString().padStart(2, '0');

      this.boxViewModel.getTotalCouponsByMonth(monthString, year)
      this.boxViewModel.getTotalDiscountByMonth(monthString, year)

    }
  }
}
