import {CommonModule} from '@angular/common';
import {Component,OnInit,inject,input} from '@angular/core';
import {BoxCouponsViewModel} from './coupons-box.view-model';

@Component({
    selector: 'app-coupon-box',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './coupon-box.component.html',
    styleUrl: './coupon-box.component.css',
})
export class CouponBoxComponent implements OnInit {
  boxType = input.required<"coupons" | "discount">()
  viewModel = inject(BoxCouponsViewModel)

  ngOnInit(): void {
    const title = document.getElementById("titulo");
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
