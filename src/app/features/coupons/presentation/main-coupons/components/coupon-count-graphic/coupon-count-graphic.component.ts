import {CommonModule,isPlatformBrowser} from '@angular/common';
import {AfterViewInit,Component,ElementRef,Inject,PLATFORM_ID,ViewChild,effect,inject, HostListener} from '@angular/core';
import {FormsModule} from '@angular/forms';
import Chart from 'chart.js/auto';
import {CouponCountGraphicViewModel} from './coupon-count-graphic.view-model';

@Component({
    selector: 'app-coupon-count-graphic',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './coupon-count-graphic.component.html',
    styleUrl: './coupon-count-graphic.component.scss',
})
export class CouponCountGraphicComponent implements AfterViewInit {
  viewModel = inject(CouponCountGraphicViewModel)
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private isPlatformBrowser: boolean;
  private chart: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isPlatformBrowser = isPlatformBrowser(platformId)

    effect(() => {
      const data = this.viewModel.count();
      if (data && data.length > 0) {
        this.createChart()
      }
    });
  }

  ngAfterViewInit() {
    if (this.isPlatformBrowser && this.chartCanvas) {
      this.setCanvasSize();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      this.createChart();
    }
  }

  private setCanvasSize() {
    const canvas = this.chartCanvas.nativeElement;
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = Math.max(350, container.clientHeight);
    }
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    if(!this.isPlatformBrowser) return;
    
    this.setCanvasSize();
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          {
            label: 'Cupones usados',
            data: this.viewModel.count(),
            borderColor: '#dfff03',
            backgroundColor: '#dfff03',
            pointRadius: 5,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            title: { display: true, text: 'Cupones usados'}, 
            min: 0, 
            ticks: {precision: 0} 
          },
          x: {
            grid: {
              display: true,
              drawOnChartArea: true
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
        },
        layout: {
          padding: {
            top: 10,
            right: 20,
            bottom: 10,
            left: 10
          }
        }
      }
    });
  }
}
