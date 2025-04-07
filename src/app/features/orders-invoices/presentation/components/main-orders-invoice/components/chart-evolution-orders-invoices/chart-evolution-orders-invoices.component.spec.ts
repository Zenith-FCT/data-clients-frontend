import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartEvolutionOrdersInvoicesComponent } from './chart-evolution-orders-invoices.component';

describe('ChartEvolutionOrdersInvoicesComponent', () => {
  let component: ChartEvolutionOrdersInvoicesComponent;
  let fixture: ComponentFixture<ChartEvolutionOrdersInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartEvolutionOrdersInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartEvolutionOrdersInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
