import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTotalOrdersInvoicesComponent } from './chart-total-orders-invoices.component';

describe('ChartTotalOrdersInvoicesComponent', () => {
  let component: ChartTotalOrdersInvoicesComponent;
  let fixture: ComponentFixture<ChartTotalOrdersInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartTotalOrdersInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartTotalOrdersInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
