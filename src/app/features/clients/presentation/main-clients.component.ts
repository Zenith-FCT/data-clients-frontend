import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon'; // Importar el módulo de iconos
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { clientsProviders } from '../clients.providers';
import { ClientsViewModel } from './clients.view-model';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule,
    MatIconModule // Añadir MatIconModule a los imports
  ],
  providers: [
    GetClientsListUseCase,
    GetTotalClientsUseCase,
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
