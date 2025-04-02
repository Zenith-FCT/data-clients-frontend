import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartInvoiceProductTypeComponent } from './chart-invoice-product-type.component';

describe('ChartInvoiceProductTypeComponent', () => {
  let component: ChartInvoiceProductTypeComponent;
  let fixture: ComponentFixture<ChartInvoiceProductTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartInvoiceProductTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartInvoiceProductTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
