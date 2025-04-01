import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceClientTypeComponent } from './invoice-client-type.component';

describe('InvoiceClientTypeComponent', () => {
  let component: InvoiceClientTypeComponent;
  let fixture: ComponentFixture<InvoiceClientTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceClientTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceClientTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
