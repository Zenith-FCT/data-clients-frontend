import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../data/clients.service';
import { Observable, map } from 'rxjs';
import { Client } from '../../domain/clients';

interface ClientInsight {
  email: string;
  metricasGenerales: {
    pedidosTotales: number;
    ingresosTotales: number;
    valorMedioPedido: number;
    antiguedadDias: number;
  };
  tendencias: {
    frecuenciaPedidos: 'Alta' | 'Media' | 'Baja';
    valorPedidos: 'Alto' | 'Medio' | 'Bajo';
    fidelidad: 'Alta' | 'Media' | 'Baja';
  };
  segmento: 'VIP' | 'Regular' | 'Ocasional';
}

@Component({
  selector: 'app-clients-data-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-data-insights.component.html',
  styleUrls: ['./clients-data-insights.component.css']
})
export class ClientsDataInsightsComponent implements OnInit {
  kpis$!: Observable<{
    totalClients: number;
    totalRevenue: number;
    avgOrderValue: number;
    totalOrders: number;
  }>;

  clientInsights$!: Observable<ClientInsight[]>;
  activityHeatmap$!: Observable<Array<{color: string; tooltip: string}>>;

  constructor(private clientesService: ClientesService) {}

  ngOnInit() {
    this.initializeKPIs();
    this.initializeClientInsights();
    this.initializeActivityHeatmap();
  }

  private initializeKPIs() {
    this.kpis$ = this.clientesService.getClients().pipe(
      map((clients: Client[]) => ({
        totalClients: clients.length,
        totalRevenue: clients.reduce((sum: number, client: Client) => sum + client.importe_total, 0),
        avgOrderValue: clients.reduce((sum: number, client: Client) => sum + client.importe_medio, 0) / clients.length,
        totalOrders: clients.reduce((sum: number, client: Client) => sum + client.cantidad_pedidos, 0)
      }))
    );
  }

  private initializeClientInsights() {
    this.clientInsights$ = this.clientesService.getClients().pipe(
      map((clients: Client[]) => {
        const maxPedidos = Math.max(...clients.map(c => c.cantidad_pedidos));
        const maxIngresos = Math.max(...clients.map(c => c.importe_total));

        return clients.map((client: Client) => {
          const antiguedadDias = Math.floor(
            (new Date().getTime() - new Date(client.fecha_primer_pedido).getTime()) / 
            (1000 * 60 * 60 * 24)
          );

          const frecuenciaPedidos = this.calcularFrecuencia(client.cantidad_pedidos, maxPedidos);
          const valorPedidos = this.calcularValorPedidos(client.importe_total, maxIngresos);
          const fidelidad = this.calcularFidelidad(antiguedadDias, client.cantidad_pedidos);

          return {
            email: client.email,
            metricasGenerales: {
              pedidosTotales: client.cantidad_pedidos,
              ingresosTotales: client.importe_total,
              valorMedioPedido: client.importe_medio,
              antiguedadDias
            },
            tendencias: {
              frecuenciaPedidos,
              valorPedidos,
              fidelidad
            },
            segmento: this.determinarSegmento(frecuenciaPedidos, valorPedidos, fidelidad)
          } as ClientInsight;
        }).sort((a: ClientInsight, b: ClientInsight) => 
          b.metricasGenerales.ingresosTotales - a.metricasGenerales.ingresosTotales
        );
      })
    );
  }

  private initializeActivityHeatmap() {
    this.activityHeatmap$ = this.clientesService.getClients().pipe(
      map((clients: Client[]) => {
        const activityLevels: number[] = Array(144).fill(0);
        
        clients.forEach((client: Client) => {
          const index = Math.floor(Math.random() * activityLevels.length);
          activityLevels[index] += client.cantidad_pedidos;
        });

        const maxActivity = Math.max(...activityLevels);

        return activityLevels.map(level => {
          const intensity = level / maxActivity;
          return {
            color: `rgba(54, 162, 235, ${intensity})`,
            tooltip: `${level} actividades registradas`
          };
        });
      })
    );
  }

  private calcularFrecuencia(pedidos: number, maxPedidos: number): 'Alta' | 'Media' | 'Baja' {
    const ratio = pedidos / maxPedidos;
    if (ratio > 0.66) return 'Alta';
    if (ratio > 0.33) return 'Media';
    return 'Baja';
  }

  private calcularValorPedidos(ingresos: number, maxIngresos: number): 'Alto' | 'Medio' | 'Bajo' {
    const ratio = ingresos / maxIngresos;
    if (ratio > 0.66) return 'Alto';
    if (ratio > 0.33) return 'Medio';
    return 'Bajo';
  }

  private calcularFidelidad(antiguedadDias: number, pedidos: number): 'Alta' | 'Media' | 'Baja' {
    const pedidosPorDia = pedidos / antiguedadDias;
    if (pedidosPorDia > 0.1) return 'Alta';
    if (pedidosPorDia > 0.05) return 'Media';
    return 'Baja';
  }

  private determinarSegmento(
    frecuencia: 'Alta' | 'Media' | 'Baja',
    valor: 'Alto' | 'Medio' | 'Bajo',
    fidelidad: 'Alta' | 'Media' | 'Baja'
  ): 'VIP' | 'Regular' | 'Ocasional' {
    const score = [frecuencia, valor, fidelidad].filter(x => x === 'Alta').length;
    if (score >= 2) return 'VIP';
    if (score >= 1) return 'Regular';
    return 'Ocasional';
  }
}