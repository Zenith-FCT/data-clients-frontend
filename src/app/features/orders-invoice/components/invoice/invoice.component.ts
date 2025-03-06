import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Chart, registerables, ActiveElement, ChartEvent } from 'chart.js';
import { Invoice } from '../../domain/models/invoice.model';
import { GetInvoicesAllUseCase } from '../../domain/use-cases/get-invoices-all.use-case';
import { ChartBuilder } from '../../services/chart-builder';
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
  private chartBuilder?: ChartBuilder;
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
      requestAnimationFrame(() => {
        this.createMonthlyChart(this.invoicesData);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chartBuilder) {
      this.chartBuilder.destroy();
    }
  }
  
  private loadInvoices(): void {
    this.loading = true;
    this.subscription = this.getInvoicesAllUseCase.execute().subscribe({
      next: (invoices) => {
        console.log('Facturas recibidas:', invoices);
        this.invoicesData = invoices;
        
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            if (this.chartCanvas?.nativeElement) {
              this.createMonthlyChart(invoices);
            }
            this.ngZone.run(() => {
              this.loading = false;
              this.cdr.detectChanges();
            });
          });
        });
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private processInvoicesIntoMonthlyData(invoices: Invoice[]): { labels: string[], values: number[] } {
    const monthlyTotals = new Array(12).fill(0);
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    invoices.forEach(invoice => {
      if (invoice.date) {
        const date = new Date(invoice.date);
        const month = date.getMonth();
        monthlyTotals[month] += invoice.amount || 0;
      }
    });

    return {
      labels: monthNames,
      values: monthlyTotals
    };
  }

  private createMonthlyChart(invoices: Invoice[]): void {
    console.log('Creando gráfico mensual...');
    if (!this.chartCanvas?.nativeElement) {
      console.error('Chart canvas not found');
      return;
    }

    const monthlyData = this.processInvoicesIntoMonthlyData(invoices);
    console.log('Datos procesados:', monthlyData);

    try {
      if (this.chartBuilder) {
        this.chartBuilder.destroy();
      }
      
      const canvas = this.chartCanvas.nativeElement;
      canvas.id = 'invoiceChart';
      this.chartBuilder = new ChartBuilder(canvas.id);
      
      const chart = this.chartBuilder.createBarChart(
        monthlyData,
        'Monto Total de Facturas por Mes (€)',
        (_event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            console.log('Bar clicked, navigating to month:', index + 1);
            this.ngZone.run(() => {
              this.navigateToDetailView(index + 1);
            });
          }
        }
      );

      if (!chart) {
        console.error('Failed to create chart');
      }
    } catch (error) {
      console.error('Error creating chart:', error);
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
