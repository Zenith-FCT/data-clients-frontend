import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainOrdersInvoiceComponent } from './main-orders-invoice.component';

describe('MainOrdersInvoiceComponent', () => {
  let component: MainOrdersInvoiceComponent;
  let fixture: ComponentFixture<MainOrdersInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainOrdersInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainOrdersInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
