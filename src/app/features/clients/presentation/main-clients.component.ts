import { Component, inject, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon'; 
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { clientsProviders } from '../clients.providers';
import { ClientsViewModel } from './clients.view-model';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';
import { GetTotalAverageOrdersUseCase } from '../domain/get-total-average-orders-use-case';
import { GetAverageTicketUseCase } from '../domain/get-average-ticket-use-case';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule,
    MatIconModule
  ],
  providers: [
    GetClientsListUseCase,
    GetTotalClientsUseCase,
    GetTotalAverageOrdersUseCase,
    GetAverageTicketUseCase,
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

  public viewModel = inject(ClientsViewModel);

  constructor() {
    effect(() => {
      this.dataSource.data = this.viewModel.clients();
    });
  }

  ngOnInit(): void {
    this.viewModel.loadData();
  }
}
