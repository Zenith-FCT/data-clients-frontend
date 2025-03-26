import {CommonModule} from '@angular/common';
import {Component,OnInit,inject,input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BoxCouponsViewModel} from './coupons-box.view-model';

@Component({
    selector: 'app-coupon-box',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './coupon-box.component.html',
    styleUrl: './coupon-box.component.css',
})
export class CouponBoxComponent implements OnInit {
  boxType = input.required<"coupons" | "discount" | "couponsMonth" | "discountMonth">()
  viewModel = inject(BoxCouponsViewModel)
  date = new Date().toISOString().substring(0, 7);

  ngOnInit(): void {
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
    const [year, month] = this.date.split("-");

    switch (this.boxType()) {
      case "couponsMonth":
        this.viewModel.getTotalCouponsByMonth(month, year);
        break;

      case "discountMonth":
        this.viewModel.getTotalDiscountByMonth(month, year);
        break;
    }


  }
}
