import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationBoxCartsComponent } from './information-box-carts.component';

describe('InformationBoxCartsComponent', () => {
  let component: InformationBoxCartsComponent;
  let fixture: ComponentFixture<InformationBoxCartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationBoxCartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationBoxCartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
