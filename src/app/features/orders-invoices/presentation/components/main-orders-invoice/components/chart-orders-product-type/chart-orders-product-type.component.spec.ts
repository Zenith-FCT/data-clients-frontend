import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOrdersProductTypeComponent } from './chart-orders-product-type.component';

describe('ChartOrdersProductTypeComponent', () => {
  let component: ChartOrdersProductTypeComponent;
  let fixture: ComponentFixture<ChartOrdersProductTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartOrdersProductTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartOrdersProductTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
