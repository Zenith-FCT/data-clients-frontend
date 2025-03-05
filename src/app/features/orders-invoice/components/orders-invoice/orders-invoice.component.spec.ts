import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersInvoiceComponent } from './orders-invoice.component';

describe('OrdersInvoiceComponent', () => {
  let component: OrdersInvoiceComponent;
  let fixture: ComponentFixture<OrdersInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});