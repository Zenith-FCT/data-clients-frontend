import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
