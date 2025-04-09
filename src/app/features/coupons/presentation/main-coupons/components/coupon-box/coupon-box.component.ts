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

  ngOnInit(): void {

    switch (this.boxType()) {
      case "coupons":
        this.viewModel.getTotalCoupons();
        break;

      case "discount":
        this.viewModel.getTotalDiscount();
        break;

    }
  }

}
