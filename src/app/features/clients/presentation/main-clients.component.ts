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
    
    if (!distribution || distribution.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
          textStyle: {
            color: '#ffffff'
          }
        }
      };
      return;
    }

    // Ordenar los datos por valor descendente para mejor visualización
    const sortedData = [...distribution].sort((a, b) => b.value - a.value);
    
    // Limitar a las top 5 categorías para mejor visualización
    const topCategories = sortedData.slice(0, 5);
    
    // Agregar "Otros" si hay más categorías
    if (sortedData.length > 5) {
      const otherCategories = sortedData.slice(5);
      const otherValue = otherCategories.reduce((sum, item) => sum + item.value, 0);
      
      if (otherValue > 0) {
        topCategories.push({
          name: 'Otros',
          value: otherValue
        });
      }
    }
    
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} clientes ({d}%)',
        backgroundColor: 'rgba(33, 33, 33, 0.9)',
        borderColor: '#444',
        textStyle: {
          color: '#ffffff'
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 10,
        data: topCategories.map(item => item.name),
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
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
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
          data: topCategories
        }
      ]
    };
  }
}
