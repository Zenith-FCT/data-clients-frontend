import {CommonModule} from '@angular/common';
import {Component, OnInit, effect, inject, AfterViewInit, ElementRef, Renderer2} from '@angular/core';
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
  pageSize = 12;
  currentPage = 0;
  
  totalItems = 0;
  totalPages = 0;
  displayData: Coupon[] = [];
  paginationDots: number[] = [];
  emptyRows: number[] = [];
  
  viewModel = inject(TableCouponsViewModel);

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    effect(() => {
      const coupons = this.viewModel.coupons();
      this.dataSource.data = coupons;
      this.totalItems = coupons.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.paginationDots = Array(this.totalPages).fill(0).map((_, i) => i);
      this.updateDisplayData();
      
      setTimeout(() => this.applyBorderToLastRow(), 100);
    });
  }

  ngOnInit(): void {
    this.viewModel.getMostUsedCoupons();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      const headerCells = this.elementRef.nativeElement.querySelectorAll('th.mat-header-cell');
      headerCells.forEach((cell: HTMLElement) => {
        this.renderer.setStyle(cell, 'color', '#000000');
        this.renderer.setStyle(cell, 'font-weight', 'bold');
        cell.style.setProperty('color', '#000000', 'important');
        cell.style.setProperty('font-weight', 'bold', 'important');
      });
      
      this.applyBorderToLastRow();
    }, 0);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updateDisplayData();
      
      setTimeout(() => this.applyBorderToLastRow(), 100);
    }
  }
  
  updateDisplayData(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.displayData = this.dataSource.data.slice(start, end);
    
    const emptyRowCount = this.pageSize - this.displayData.length;
    this.emptyRows = emptyRowCount > 0 ? Array(emptyRowCount).fill(0).map((_, i) => i) : [];
  }
  
  private applyBorderToLastRow(): void {
    const rows = this.elementRef.nativeElement.querySelectorAll('tr.mat-mdc-row:not(.empty-row)');
    
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      
      const cells = lastRow.querySelectorAll('td');
      cells.forEach((cell: HTMLElement) => {
        cell.style.setProperty('border-bottom', '1px solid #FFFFFF', 'important');
      });
    }
  }
}
