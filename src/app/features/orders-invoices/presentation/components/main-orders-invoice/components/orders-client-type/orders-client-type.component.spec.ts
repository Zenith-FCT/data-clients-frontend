import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersClientTypeComponent } from './orders-client-type.component';

describe('OrdersClientTypeComponent', () => {
  let component: OrdersClientTypeComponent;
  let fixture: ComponentFixture<OrdersClientTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersClientTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersClientTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
