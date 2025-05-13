import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { GetProductSalesEvolutionUseCase } from '../../../domain/get-product-sales-evolution-use-case';
import { ProductSalesEvolutionModel } from '../../../domain/product-sales-evolution.model';

interface UIState {
  productSalesEvolution: ProductSalesEvolutionModel[];
  selectedProductIds: string[];
  selectedYear: number | null;
  availableYears: number[];
  loading: boolean;
  error: string | null;
}

@Injectable()
export class ProductSalesEvolutionViewModel {
  private getProductSalesEvolutionUseCase = inject(GetProductSalesEvolutionUseCase);
  
  // Estado UI
  private uiState = signal<UIState>({
    productSalesEvolution: [],
    selectedProductIds: [],
    selectedYear: null,
    availableYears: [],
    loading: false,
    error: null
  });
  
  // Selectores reactivos públicos
  public readonly productSalesEvolution$ = computed(() => this.uiState().productSalesEvolution);
  public readonly selectedProductIds$ = computed(() => this.uiState().selectedProductIds);
  public readonly selectedYear$ = computed(() => this.uiState().selectedYear);
  public readonly availableYears$ = computed(() => this.uiState().availableYears);
  public readonly loading$ = computed(() => this.uiState().loading);
  public readonly error$ = computed(() => this.uiState().error);
  
  // Selector para obtener solo los productos seleccionados para mostrar en el gráfico
  public readonly selectedProductsEvolution$ = computed(() => {
    const selectedIds = this.selectedProductIds$();
    const selectedYear = this.selectedYear$();
    
    let filteredProducts = this.productSalesEvolution$();
    
    // Filtrar por productos seleccionados
    if (selectedIds.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        selectedIds.includes(product.productId)
      );
    } else {
      // Si no hay productos seleccionados, devolvemos los top 5 productos
      filteredProducts = this.getTopProducts(5);
    }
    
    // Filtrar datos por año seleccionado
    if (selectedYear) {
      filteredProducts = filteredProducts.map(product => {
        const filteredSales = product.monthlySales.filter(sale => 
          sale.month.startsWith(selectedYear.toString())
        );
        
        return {
          ...product,
          monthlySales: filteredSales
        };
      });
    }
    
    return filteredProducts;
  });
  
  // Selector para obtener la lista de productos disponibles para el selector
  public readonly availableProducts$ = computed(() => {
    return this.productSalesEvolution$().map(product => ({
      id: product.productId,
      name: product.productName
    }));
  });
  
  constructor() {
    console.log('ProductSalesEvolutionViewModel iniciado');
  }
  
  // Cargar los datos de evolución de ventas
  public loadProductSalesEvolution(): void {
    if (this.uiState().loading) return;
    
    this.updateState({ loading: true, error: null });
    
    this.getProductSalesEvolutionUseCase.execute().pipe(
      tap(data => console.log(`ProductSalesEvolutionViewModel: Datos recibidos - ${data.length} productos`)),
      finalize(() => this.updateState({ loading: false }))
    ).subscribe({
      next: (productSalesEvolution) => {
        this.updateState({ productSalesEvolution });
        
        // Extraer años disponibles
        const years = this.extractAvailableYears(productSalesEvolution);
        this.updateState({ 
          availableYears: years,
          selectedYear: years.length > 0 ? Math.max(...years) : null // Seleccionar el año más reciente
        });
        
        // Si aún no hay productos seleccionados, seleccionamos los top 5 por defecto
        if (this.selectedProductIds$().length === 0) {
          const topProductIds = this.getTopProducts(5).map(p => p.productId);
          this.updateState({ selectedProductIds: topProductIds });
        }
      },
      error: (error) => {
        console.error('Error al cargar la evolución de ventas de productos:', error);
        this.updateState({ 
          error: 'Error al cargar los datos de evolución de ventas de productos' 
        });
      }
    });
  }
  
  // Actualizar la selección de productos
  public setSelectedProductIds(productIds: string[]): void {
    this.updateState({ selectedProductIds: productIds });
  }
  
  // Actualizar el año seleccionado
  public setSelectedYear(year: number): void {
    this.updateState({ selectedYear: year });
  }
  
  // Extraer los años disponibles de los datos
  private extractAvailableYears(products: ProductSalesEvolutionModel[]): number[] {
    const years = new Set<number>();
    
    products.forEach(product => {
      product.monthlySales.forEach(sale => {
        const year = parseInt(sale.month.split('-')[0]);
        years.add(year);
      });
    });
    
    return Array.from(years).sort();
  }
    // Obtener los productos con más ventas totales
  private getTopProducts(limit: number): ProductSalesEvolutionModel[] {
    const products = [...this.productSalesEvolution$()];
      // Calcular ventas totales por producto
    const productsWithTotalSales = products.map(product => {
      const totalSales = product.monthlySales.reduce(
        (sum: number, month: { month: string; salesCount: number }) => sum + month.salesCount, 
        0
      );
      return { ...product, totalSales };
    });
    
    // Ordenar por ventas totales y tomar los primeros 'limit'
    return productsWithTotalSales
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);
  }
  
  // Método privado para actualizar el estado
  private updateState(newState: Partial<UIState>): void {
    this.uiState.update(state => ({ ...state, ...newState }));
  }
}
