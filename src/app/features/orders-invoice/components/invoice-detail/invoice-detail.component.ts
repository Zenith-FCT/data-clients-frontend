import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Invoice, Product } from '../../domain/models/invoice.model';
import { GetInvoicesForMonthUseCase } from '../../domain/use-cases/get-invoices-for-month.use-case';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');
Chart.register(...registerables);

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('detailChartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  
  loading = true;
  month: number = 0;
  year: number = 0;
  monthName: string = '';
  invoices: Invoice[] = [];
  totalAmount: number = 0;
  productSales: { productName: string, quantity: number, totalAmount: number }[] = [];
  dailySales: { date: Date, quantity: number, total: number }[] = [];
  private chart?: Chart;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getInvoicesForMonthUseCase: GetInvoicesForMonthUseCase,
    private ngZone: NgZone
  ) {}
  
  ngOnInit(): void {
    const paramsSub = this.route.queryParams.subscribe(params => {
      this.month = +params['month'] || new Date().getMonth() + 1;
      this.year = +params['year'] || new Date().getFullYear();
      this.setMonthName();
      this.loadMonthlyInvoiceData();
    });
    this.subscriptions.push(paramsSub);
  }

  ngAfterViewInit(): void {
    if (this.productSales.length > 0 && this.chartCanvas?.nativeElement) {
      requestAnimationFrame(() => {
        this.createChart();
      });
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.chart) {
      this.chart.destroy();
    }
  }
  
  private setMonthName(): void {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.monthName = monthNames[this.month - 1] || '';
  }
  
  private loadMonthlyInvoiceData(): void {
    this.loading = true;
    console.log(`Cargando datos de facturas para mes: ${this.month}, año: ${this.year}`);
    
    const dataSub = this.getInvoicesForMonthUseCase.execute(this.month, this.year).subscribe({
      next: (invoices) => {
        console.log('Facturas recibidas para el mes:', invoices);
        this.invoices = invoices || [];
        this.processInvoiceData();
        
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            if (this.productSales.length > 0 && this.chartCanvas?.nativeElement) {
              this.createChart();
            }
            this.ngZone.run(() => {
              this.loading = false;
            });
          });
        });
      },
      error: (error) => {
        console.error('Error cargando facturas mensuales:', error);
        this.loading = false;
        this.invoices = [];
        this.productSales = [];
      }
    });
    
    this.subscriptions.push(dataSub);
  }
  
  private processInvoiceData(): void {
    try {
      if (!this.invoices || this.invoices.length === 0) {
        this.totalAmount = 0;
        this.productSales = [];
        this.dailySales = [];
        return;
      }
      
      this.totalAmount = this.invoices.reduce((sum, invoice) => sum + (invoice?.amount || 0), 0);
      
      // Process product sales
      const productMap = new Map<string, { quantity: number; totalAmount: number }>();
      
      this.invoices.forEach(invoice => {
        if (!invoice || !invoice.product) return;
        
        const productName = this.getProductDisplayName(invoice.product);
        const amount = invoice.amount || 0;
        
        if (!productMap.has(productName)) {
          productMap.set(productName, { quantity: 0, totalAmount: 0 });
        }
        
        const productData = productMap.get(productName)!;
        productData.quantity += 1;
        productData.totalAmount += amount;
      });
      
      this.productSales = Array.from(productMap.entries())
        .map(([productName, data]) => ({
          productName,
          quantity: data.quantity,
          totalAmount: data.totalAmount
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      // Process daily sales
      const dailyMap = new Map<string, { quantity: number; total: number }>();
      
      this.invoices.forEach(invoice => {
        if (!invoice?.date) return;
        
        const dateStr = new Date(invoice.date).toDateString();
        if (!dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, { quantity: 0, total: 0 });
        }
        
        const dayData = dailyMap.get(dateStr)!;
        dayData.quantity += 1;
        dayData.total += invoice.amount || 0;
      });

      this.dailySales = Array.from(dailyMap.entries())
        .map(([dateStr, data]) => ({
          date: new Date(dateStr),
          quantity: data.quantity,
          total: data.total
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
    } catch (error) {
      console.error('Error procesando datos de facturas:', error);
      this.productSales = [];
      this.dailySales = [];
      this.totalAmount = 0;
    }
  }
  
  getProductDisplayName(product: Product): string {
    switch (product) {
      case Product.MASTER:
        return 'Master';
      case Product.CURSO:
        return 'Curso';
      case Product.MEMBRESIA:
        return 'Membresía';
      default:
        return 'Producto sin nombre';
    }
  }
  
  private createChart(): void {
    if (!this.productSales.length || !this.chartCanvas) {
      console.warn('No hay datos de ventas para crear el gráfico o no se encontró el canvas');
      return;
    }
    
    try {
      const canvas = this.chartCanvas.nativeElement;
      canvas.id = 'monthlyDetailChart'; // Asegurarse de que el canvas tenga un ID
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas');
        return;
      }
      
      if (this.chart) {
        this.chart.destroy();
      }
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: this.productSales.map(p => p.productName),
          datasets: [{
            label: `Ventas de ${this.monthName} ${this.year}`,
            data: this.productSales.map(p => p.totalAmount),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Ventas por Producto - ${this.monthName} ${this.year}`,
              font: { size: 16 }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const value = context.raw as number;
                  return `€${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Monto (€)'
              },
              ticks: {
                callback: (value: any) => `€${value}`
              }
            },
            x: {
              title: {
                display: true,
                text: 'Productos'
              }
            }
          }
        }
      };
      
      this.chart = new Chart(ctx, config);
      console.log('Gráfico creado exitosamente');
      
    } catch (error) {
      console.error('Error creando el gráfico:', error);
    }
  }

  goBack(): void {
    this.router.navigate(['/orders/dashboard']);
  }
}
