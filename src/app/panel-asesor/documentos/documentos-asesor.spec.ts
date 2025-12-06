import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentosAsesorComponent } from './documentos-asesor';

describe('DocumentosAsesorComponent', () => {
  let component: DocumentosAsesorComponent;
  let fixture: ComponentFixture<DocumentosAsesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentosAsesorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentosAsesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
