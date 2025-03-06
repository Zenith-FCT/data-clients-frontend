import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Chart, registerables, ChartEvent, ActiveElement } from 'chart.js';
import { Invoice } from '../../domain/models/invoice.model';
import { GetInvoicesAllUseCase } from '../../domain/use-cases/get-invoices-all.use-case';
import { ChartFactory } from '../../services/chart-factory';
import { DataProcessor } from '../../services/data-processor';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  loading = true;
  private subscription?: Subscription;
  private invoicesData: Invoice[] = [];
  
  constructor(
    private getInvoicesAllUseCase: GetInvoicesAllUseCase,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit(): void {
    if (this.invoicesData.length > 0) {
      setTimeout(() => {
        this.createMonthlyChart();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    ChartFactory.destroyCharts();
  }
  
  private loadInvoices(): void {
    this.loading = true;
    this.subscription = this.getInvoicesAllUseCase.execute().subscribe({
      next: (invoices) => {
        console.log('Facturas recibidas:', invoices);
        this.invoicesData = invoices;
        
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            this.createMonthlyChart();
            this.ngZone.run(() => {
              this.loading = false;
              this.cdr.detectChanges();
            });
          }, 100);
        });
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private createMonthlyChart(): void {
    console.log('Creando gráfico mensual...');
    if (!this.chartCanvas?.nativeElement) {
      console.error('Chart canvas not found');
      return;
    }

    try {
      ChartFactory.destroyCharts();
      
      const canvas = this.chartCanvas.nativeElement;
      const canvasId = 'monthly-invoices-chart';
      canvas.id = canvasId;
      
      // Usar DataProcessor para generar los datos del gráfico de barras mensual
      const barChartData = DataProcessor.generateMonthlyBarChartData(this.invoicesData);
      
      const chart = ChartFactory.createBarChart(
        canvasId,
        barChartData,
        'Monto Total de Facturas por Mes (€)',
        this.handleChartClick.bind(this)
      );
      
      if (!chart) {
        console.error('Failed to create monthly chart');
      }
    } catch (error) {
      console.error('Error creating monthly chart:', error);
    }
  }
  
  private handleChartClick(_event: ChartEvent, elements: ActiveElement[], _chart: Chart): void {
    if (elements.length > 0) {
      const index = elements[0].index;
      console.log('Bar clicked, navigating to month:', index + 1);
      this.ngZone.run(() => {
        this.navigateToDetailView(index + 1);
      });
    }
  }

  private navigateToDetailView(month: number): void {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    
    this.router.navigate(['/orders/detail'], {
      queryParams: {
        month: month,
        year: year
      }
    });
  }
}
