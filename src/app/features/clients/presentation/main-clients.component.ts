import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { Clients } from '../domain/clients.model';
import { GetAllClientsUseCase } from '../domain/get-all-clients-use-case';
import { clientsProviders } from '../clients.providers';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule
  ],
  providers: [
    GetAllClientsUseCase,
    ...clientsProviders
  ],
  templateUrl: './main-clients.component.html',
  styleUrls: ['./main-clients.component.scss']
})
export class ClientsComponent implements OnInit {
  dataSource = new MatTableDataSource<Clients>([]);
  displayedColumns: string[] = ['email', 'orderCount', 'ltv', 'averageOrderValue'];
  isLoading = true;
  error: string | null = null;

  constructor(private getAllClientsUseCase: GetAllClientsUseCase) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.error = null;
    
    this.getAllClientsUseCase.execute().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.error = 'Error al cargar los clientes: ' + (err.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }
}
