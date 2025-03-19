import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Clients } from '../domain/clients.model';
import { GetAllClientsUseCase } from '../domain/get-all-clients-use-case';
import { clientsProviders } from '../clients.providers';
import { ClientsViewModel } from './clients.view-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule
  ],
  providers: [
    GetAllClientsUseCase,
    ...clientsProviders,
    ClientsViewModel
  ],
  templateUrl: './main-clients.component.html',
  styleUrls: ['./main-clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ClientsComponent implements OnInit {
  dataSource = new MatTableDataSource<Clients>([]);
  displayedColumns: string[] = ['email', 'orderCount', 'ltv', 'averageOrderValue'];

  public viewModel = inject(ClientsViewModel);

  constructor() {
    effect(() => {
      this.dataSource.data = this.viewModel.clients();
    });
  }

  ngOnInit(): void {
    this.viewModel.loadClients();
  }
}
