import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Casos } from './casos';

describe('Casos', () => {
  let component: Casos;
  let fixture: ComponentFixture<Casos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Casos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Casos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
