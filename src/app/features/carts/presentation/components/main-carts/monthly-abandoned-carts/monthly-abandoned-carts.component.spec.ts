import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAbandonedCartsComponent } from './monthly-abandoned-carts.component';

describe('MonthlyAbandonedCartsComponent', () => {
  let component: MonthlyAbandonedCartsComponent;
  let fixture: ComponentFixture<MonthlyAbandonedCartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyAbandonedCartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyAbandonedCartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
