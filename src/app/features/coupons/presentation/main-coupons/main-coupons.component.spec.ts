import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCouponsComponent } from './main-coupons.component';

describe('MainCouponsComponent', () => {
  let component: MainCouponsComponent;
  let fixture: ComponentFixture<MainCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCouponsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
