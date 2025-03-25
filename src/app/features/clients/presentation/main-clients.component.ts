import { Component, inject, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { NgxEchartsModule } from 'ngx-echarts';
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { clientsProviders } from '../clients.providers';
import { ClientsViewModel } from './clients.view-model';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';
import { GetTotalAverageOrdersUseCase } from '../domain/get-total-average-orders-use-case';
import { GetAverageTicketUseCase } from '../domain/get-average-ticket-use-case';
import { GetClientsPerProductUseCase } from '../domain/get-clients-per-product-use-case';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule,
    MatIconModule,
    NgxEchartsModule
  ],
  providers: [
    GetClientsListUseCase,
    GetTotalClientsUseCase,
    GetTotalAverageOrdersUseCase,
    GetAverageTicketUseCase,
    GetClientsPerProductUseCase,
    ...clientsProviders,
    ClientsViewModel
  ],
  templateUrl: './main-clients.component.html',
  styleUrls: ['./main-clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ClientsComponent implements OnInit {
  dataSource = new MatTableDataSource<ClientsList>([]);
  displayedColumns: string[] = ['email', 'orderCount', 'ltv', 'averageOrderValue'];
  chartOption: any;

  public viewModel = inject(ClientsViewModel);

  constructor() {
    effect(() => {
      this.dataSource.data = this.viewModel.clients();
      this.updateChartOption();
    });
  }

  ngOnInit(): void {
    this.viewModel.loadData();
  }

  private updateChartOption(): void {
    const distribution = this.viewModel.clientsPerProduct();
    
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} clientes ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: distribution.map(item => item.name),
        textStyle: {
          color: '#ffffff'
        }
      },
      series: [
        {
          name: 'Clientes por Categoría',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#212121',
            borderWidth: 2
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
              color: '#ffffff'
            }
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}',
            color: '#ffffff'
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: '#ffffff'
            }
          },
          data: distribution.sort((a, b) => b.value - a.value)
        }
      ]
    };
  }
}
