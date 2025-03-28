import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTmComponent } from './chart-tm.component';

describe('ChartTmComponent', () => {
  let component: ChartTmComponent;
  let fixture: ComponentFixture<ChartTmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartTmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartTmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
