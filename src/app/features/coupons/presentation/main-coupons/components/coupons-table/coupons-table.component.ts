import {CommonModule} from '@angular/common';
import {Component,OnInit,effect,inject} from '@angular/core';
import {MatTableDataSource,MatTableModule} from '@angular/material/table';
import {Coupon} from '../../../../domain/models/coupons.models';
import {MonthlySalesViewModel} from './coupons-table.view-model';

@Component({
    selector: 'app-coupons-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule
    ],
    templateUrl: './coupons-table.component.html',
    styleUrl: './coupons-table.component.css',
})
export class CouponsTableComponent implements OnInit  {
  dataSource = new MatTableDataSource<Coupon>([]);
  displayedColumns: string[] = ['name', 'count'];

  viewModel = inject(MonthlySalesViewModel)

  constructor() {
    effect(() => {
      this.dataSource.data = this.viewModel.coupons();
    });
  }

  ngOnInit(): void {
    this.viewModel.getMostUsedCoupons()
  }
}
