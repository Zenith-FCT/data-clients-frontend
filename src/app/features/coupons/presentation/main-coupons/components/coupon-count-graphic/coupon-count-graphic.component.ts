import {CommonModule,isPlatformBrowser} from '@angular/common';
import {AfterViewInit,Component,ElementRef,Inject,PLATFORM_ID,ViewChild,effect,inject} from '@angular/core';
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

  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    if(!isPlatformBrowser) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          {
            label: 'Cupones usados',
            data: this.viewModel.count(),
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 1)',
            pointRadius: 5,
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { title: { display: true, text: 'Cupones usados'}, min: 0, ticks: {precision: 0} },
        },

        plugins: {
          legend: {
            display: false
          },

        }
      }
    });
  }

}
