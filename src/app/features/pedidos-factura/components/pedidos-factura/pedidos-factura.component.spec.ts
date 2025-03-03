import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosFacturaComponent } from './pedidos-factura.component';

describe('PedidosFacturaComponent', () => {
  let component: PedidosFacturaComponent;
  let fixture: ComponentFixture<PedidosFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosFacturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
