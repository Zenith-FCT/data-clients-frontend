import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainClientsComponent } from './main-clients.component';

describe('MainClientsComponent', () => {
  let component: MainClientsComponent;
  let fixture: ComponentFixture<MainClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
