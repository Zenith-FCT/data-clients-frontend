import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyCartRateAbandonedComponent } from './monthly-cart-rate-abandoned.component';

describe('MonthlyCartRateAbandonedComponent', () => {
  let component: MonthlyCartRateAbandonedComponent;
  let fixture: ComponentFixture<MonthlyCartRateAbandonedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyCartRateAbandonedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyCartRateAbandonedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
