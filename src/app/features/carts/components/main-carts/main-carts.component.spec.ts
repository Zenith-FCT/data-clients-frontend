import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCartsComponent } from './main-carts.component';

describe('MainCartsComponent', () => {
  let component: MainCartsComponent;
  let fixture: ComponentFixture<MainCartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
