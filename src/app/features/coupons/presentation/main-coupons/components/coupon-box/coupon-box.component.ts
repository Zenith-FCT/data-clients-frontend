import {CommonModule} from '@angular/common';
import {Component,OnInit,inject,input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BoxCouponsViewModel} from './coupons-box.view-model';

@Component({
    selector: 'app-coupon-box',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './coupon-box.component.html',
    styleUrl: './coupon-box.component.scss',
})
export class CouponBoxComponent implements OnInit {
  boxType = input.required<"coupons" | "discount" | "couponsMonth" | "discountMonth">()
  viewModel = inject(BoxCouponsViewModel)
  date = new Date().toISOString().substring(0, 7);
  selectedYear: string = new Date().getFullYear() + "";
  selectedMonth: string = '';
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

  ngOnInit(): void {
    const fechaActual = new Date();
    const mesActual = (fechaActual.getMonth() + 1).toString().padStart(2, '0');

    this.selectedMonth = mesActual
    switch (this.boxType()) {
      case "coupons":
        this.viewModel.getTotalCoupons();
        break;

      case "discount":
        this.viewModel.getTotalDiscount();
        break;

      case "couponsMonth":
        this.changeDate();
        break;

      case "discountMonth":
        this.changeDate();
        break;
    }
  }

  changeDate() {
    switch (this.boxType()) {
      case "couponsMonth":
        this.viewModel.getTotalCouponsByMonth(this.selectedMonth, this.selectedYear);
        break;

      case "discountMonth":
        this.viewModel.getTotalDiscountByMonth(this.selectedMonth, this.selectedYear);
        break;
    }


  }
}
