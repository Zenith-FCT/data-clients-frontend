import {CommonModule} from '@angular/common';
import {Component,OnInit,inject} from '@angular/core';
import {MatTableDataSource,MatTableModule} from '@angular/material/table';
import {Coupon} from '../../domain/models/coupons.models';
import {GetMostUsedCouponsUseCase} from '../../domain/useCases/getMOstUsedCouponsUseCase';

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
  isLoading = true;
  error: string | null = null;
  //coupons = input.required<Coupon[]>()

  getMostUsedCouponsUseCase = inject(GetMostUsedCouponsUseCase);

  ngOnInit(): void {
    this.getMostUsedCouponsUseCase.execute().subscribe(
      {
        next: (data) => {
          this.dataSource.data = data;
          this.isLoading = false
        }
      }
    )
  }
}
