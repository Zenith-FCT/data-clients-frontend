import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTotalInvoiceComponent } from './chart-total-invoice.component';

describe('ChartTotalInvoiceComponent', () => {
  let component: ChartTotalInvoiceComponent;
  let fixture: ComponentFixture<ChartTotalInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartTotalInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartTotalInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
