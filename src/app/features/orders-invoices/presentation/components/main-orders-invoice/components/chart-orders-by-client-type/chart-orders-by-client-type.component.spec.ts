import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOrdersByClientTypeComponent } from './chart-orders-by-client-type.component';

describe('ChartOrdersByClientTypeComponent', () => {
  let component: ChartOrdersByClientTypeComponent;
  let fixture: ComponentFixture<ChartOrdersByClientTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartOrdersByClientTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartOrdersByClientTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
