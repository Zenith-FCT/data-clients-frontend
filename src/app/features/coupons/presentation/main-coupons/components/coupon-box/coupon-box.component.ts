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

  }

  getDescription(): string {
    const month = this.viewModel.month()
    const year = this.viewModel.year();
    const totalYears = this.viewModel.totalYears();

    if((this.boxType() == "couponsMonth" || this.boxType() == "discountMonth") && month != "0") {
      const monthName = this.getMonthName(Number(month));
      return this.boxType() === 'coupons'
        ? `Cupones utilizados en ${monthName} del ${year}`
        : `Total descuento en ${monthName} del ${year}`;
    }

    switch (this.boxType()) {
      case 'coupons':
        return totalYears ? 'Total cupones (todos los años)' : `Total cupones en ${year}`;
      case 'couponsMonth':
        return  `Total de cupones en ${year}`;
      case 'discount':
        return totalYears ? 'Total descuento (todos los años)' : `Total descuento en ${year}`;
      case 'discountMonth':
        return `Total descuento en ${year}`;
    }
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

}
