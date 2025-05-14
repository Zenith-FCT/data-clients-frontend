import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TopProductsViewModel } from './top-products.view-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-top-products-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-products-table.component.html',
  styleUrl: './top-products-table.component.scss'
})
export class TopProductsTableComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isBrowser: boolean;
  currentPageSignal = signal(0);
  itemsPerPage = 9;
  
  get currentPage(): number {
    return this.currentPageSignal();
  }
    set currentPage(value: number) {
    this.currentPageSignal.set(value);
  }
  paginatedProducts = computed(() => {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const sortedProducts = [...this.viewModel.topProducts$()]
      .sort((a, b) => b.salesCount - a.salesCount);
    return sortedProducts.slice(start, end);
  });
  
  totalPages = computed(() => {
    const total = this.viewModel.topProducts$().length;
    return Math.ceil(total / this.itemsPerPage);
  });

  constructor(
    public viewModel: TopProductsViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser && !this.isTestEnvironment()) {
      this.viewModel.ensureDataLoaded();
    }
  }

  /**
   * Determina si la aplicación está ejecutándose en un entorno de pruebas
   * @returns true si se detecta que es un entorno de pruebas
   */
  private isTestEnvironment(): boolean {
    return (
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test'))))
    );
  }  
  goToPage(page: number): void {
    console.log('Navegando a página:', page);
    if (page >= 0 && page < this.totalPages()) {
      this.currentPageSignal.set(page);
      console.log('Página actual después del cambio:', this.currentPage);
    }
  }
  

  createRange(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  nextPage(): void {
    console.log('Página siguiente');
    if (this.currentPage < this.totalPages() - 1) {
      this.currentPage = this.currentPage + 1;
    }
  }
  
 
  prevPage(): void {
    console.log('Página anterior');
    if (this.currentPage > 0) {
      this.currentPage = this.currentPage - 1;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
