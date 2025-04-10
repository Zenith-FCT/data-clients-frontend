import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionAbandonedCartsComponent } from './evolution-abandoned-carts.component';

describe('EvolutionAbandonedCartsComponent', () => {
  let component: EvolutionAbandonedCartsComponent;
  let fixture: ComponentFixture<EvolutionAbandonedCartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionAbandonedCartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolutionAbandonedCartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
