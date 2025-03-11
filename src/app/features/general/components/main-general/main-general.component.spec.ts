import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGeneralComponent } from './main-general.component';

describe('MainGeneralComponent', () => {
  let component: MainGeneralComponent;
  let fixture: ComponentFixture<MainGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
