import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ClientsChartsComponent } from '../clients-charts/clients-charts.component';
import { ClientsDataInsightsComponent } from '../clients-data-insights/clients-data-insights.component';
import { Client } from '../../domain/clients';
import { GetClientsUseCase } from '../../domain/get-clients.use-case';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    ClientsChartsComponent, 
    ClientsDataInsightsComponent
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients$!: Observable<Client[]>;
  getClientsUseCase = inject(GetClientsUseCase);
  activeTab: 'charts' | 'insights' = 'charts';

  ngOnInit() {
    this.clients$ = this.getClientsUseCase.execute();
  }

  setActiveTab(tab: 'charts' | 'insights') {
    this.activeTab = tab;
  }
}
