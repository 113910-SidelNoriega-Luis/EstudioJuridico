import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesComponent } from './reportes';
import { ReportesService } from './reportes.service';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let reportesService: ReportesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [ReportesService],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    reportesService = TestBed.inject(ReportesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reportes on init', () => {
    spyOn(reportesService, 'cargarReportes');
    component.ngOnInit();
    expect(reportesService.cargarReportes).toHaveBeenCalled();
  });

  it('should filter reportes by type', () => {
    component.filtrarPor('casos');
    expect(component.tipoFiltro()).toBe('casos');
  });

  it('should toggle formulario visibility', () => {
    expect(component.mostrarFormulario()).toBe(false);
    component.abrirFormulario();
    expect(component.mostrarFormulario()).toBe(true);
    component.cerrarFormulario();
    expect(component.mostrarFormulario()).toBe(false);
  });
});
