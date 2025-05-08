import {CommonModule} from '@angular/common';
import {Component, OnInit, effect, inject, AfterViewInit} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Coupon} from '../../../../domain/models/coupons.models';
import {TableCouponsViewModel} from './coupons-table.view-model';

@Component({
    selector: 'app-coupons-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
    ],
    templateUrl: './coupons-table.component.html',
    styleUrl: './coupons-table.component.scss',
})
export class CouponsTableComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Coupon>([]);
  displayedColumns: string[] = ['name', 'count'];
  pageSize = 10;
  currentPage = 0;
  
  totalItems = 0;
  totalPages = 0;
  displayData: Coupon[] = [];
  paginationDots: number[] = [];
  emptyRows: number[] = [];
  
  viewModel = inject(TableCouponsViewModel);

  constructor() {
    effect(() => {
      const coupons = this.viewModel.coupons();
      this.dataSource.data = coupons;
      this.totalItems = coupons.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.paginationDots = Array(this.totalPages).fill(0).map((_, i) => i);
      this.updateDisplayData();
    });
  }

  ngOnInit(): void {
    this.viewModel.getMostUsedCoupons();
  }
  
  ngAfterViewInit(): void {
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updateDisplayData();
    }
  }
  
  updateDisplayData(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.displayData = this.dataSource.data.slice(start, end);
    
    const emptyRowCount = this.pageSize - this.displayData.length;
    this.emptyRows = emptyRowCount > 0 ? Array(emptyRowCount).fill(0).map((_, i) => i) : [];
  }
}
