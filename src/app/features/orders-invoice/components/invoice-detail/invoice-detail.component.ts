import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { Invoice, Product } from '../../domain/models/invoice.model';
import { GetInvoicesForMonthUseCase } from '../../domain/use-cases/get-invoices-for-month.use-case';
import { ChartFactory } from '../../services/chart-factory';
import { DataProcessor, ProductSaleData, DailySaleData } from '../../services/data-processor';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');
Chart.register(...registerables);

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('detailChartCanvas', { static: false }) detailChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('dailySalesChartCanvas', { static: false }) dailySalesChartCanvas?: ElementRef<HTMLCanvasElement>;
  
  loading = true;
  month: number = 0;
  year: number = 0;
  monthName: string = '';
  invoices: Invoice[] = [];
  totalAmount: number = 0;
  productSales: ProductSaleData[] = [];
  dailySales: DailySaleData[] = [];
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getInvoicesForMonthUseCase: GetInvoicesForMonthUseCase,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    const paramsSub = this.route.queryParams.subscribe(params => {
      this.month = +params['month'] || new Date().getMonth() + 1;
      this.year = +params['year'] || new Date().getFullYear();
      this.monthName = DataProcessor.getMonthName(this.month);
      this.loadMonthlyInvoiceData();
    });
    this.subscriptions.push(paramsSub);
  }

  ngAfterViewInit(): void {
    // Los gráficos se inicializarán después de cargar datos
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    ChartFactory.destroyCharts();
  }
  
  private loadMonthlyInvoiceData(): void {
    this.loading = true;
    console.log(`Cargando datos de facturas para mes: ${this.month}, año: ${this.year}`);
    
    const dataSub = this.getInvoicesForMonthUseCase.execute(this.month, this.year).subscribe({
      next: (invoices) => {
        console.log('Facturas recibidas para el mes:', invoices);
        this.invoices = invoices || [];
        
        // Usar el procesador de datos para procesar las facturas
        const processedData = DataProcessor.processInvoiceData(this.invoices);
        this.totalAmount = processedData.totalAmount;
        this.productSales = processedData.productSales;
        this.dailySales = processedData.dailySales;
        
        // Esperar hasta el siguiente ciclo de detección de cambios
        setTimeout(() => {
          this.createCharts();
          this.loading = false;
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando facturas mensuales:', error);
        this.loading = false;
        this.invoices = [];
        this.productSales = [];
        this.dailySales = [];
        this.cdr.detectChanges();
      }
    });
    
    this.subscriptions.push(dataSub);
  }
  
  getProductDisplayName(product: Product): string {
    return DataProcessor.getProductDisplayName(product);
  }
  
  private createCharts(): void {
    try {
      // Destruir cualquier gráfico existente para evitar sobreposiciones
      ChartFactory.destroyCharts();
      
      // Esperar un momento para asegurar que los elementos del DOM estén listos
      setTimeout(() => {
        this.createPieChart();
        this.createLineChart();
      }, 100);
    } catch (error) {
      console.error('Error creating charts:', error);
    }
  }
  
  private createPieChart(): void {
    if (this.productSales.length > 0 && this.detailChartCanvas) {
      console.log('Initializing pie chart...');
      const canvas = this.detailChartCanvas.nativeElement;
      const canvasId = 'product-sales-pie-chart';
      canvas.id = canvasId;
      
      // Usar DataProcessor para generar los datos del gráfico
      const pieChartData = DataProcessor.generateProductPieChartData(this.productSales);
      
      const pieChart = ChartFactory.createPieChart(
        canvasId,
        pieChartData,
        `Distribución de Ventas por Producto - ${this.monthName} ${this.year}`
      );
      console.log('Pie chart created:', pieChart ? 'Success' : 'Failed');
    }
  }
  
  private createLineChart(): void {
    if (this.dailySalesChartCanvas) {
      console.log('Initializing line chart...');
      const canvas = this.dailySalesChartCanvas.nativeElement;
      const canvasId = 'daily-sales-line-chart';
      canvas.id = canvasId;
      
      // Usar DataProcessor para generar los datos del gráfico
      const lineChartData = DataProcessor.generateDailyChartData(
        this.dailySales, 
        this.year, 
        this.month
      );
      
      const lineChart = ChartFactory.createLineChart(
        canvasId,
        lineChartData,
        `Tendencia de Ventas Diarias - ${this.monthName} ${this.year}`
      );
      console.log('Line chart created:', lineChart ? 'Success' : 'Failed');
    }
  }

  goBack(): void {
    this.router.navigate(['/orders/dashboard']);
  }
}