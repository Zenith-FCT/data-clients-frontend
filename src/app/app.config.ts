import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxEchartsModule } from 'ngx-echarts';
import { OrdersRepository } from './features/orders-invoices/domain/repositories/orders-repository';
import { OrdersDataRepository } from './features/orders-invoices/data/data-repositories/orders-repository.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()), 
    provideAnimationsAsync(),
    OrdersDataRepository,
    { provide: OrdersRepository, useExisting: OrdersDataRepository },
    importProvidersFrom(
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
      })
    )
  ]
};
