import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReporteComponent } from './crear-reporte';
import { ReportesService } from '../reportes.service';

describe('CrearReporteComponent', () => {
  let component: CrearReporteComponent;
  let fixture: ComponentFixture<CrearReporteComponent>;
  let reportesService: ReportesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearReporteComponent],
      providers: [ReportesService],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearReporteComponent);
    component = fixture.componentInstance;
    reportesService = TestBed.inject(ReportesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty initial form values', () => {
    expect(component.titulo).toBe('');
    expect(component.descripcion).toBe('');
    expect(component.tipoReporte).toBe('');
    expect(component.autor).toBe('');
  });

  it('should emit cerrado when cancelar is called', () => {
    spyOn(component.cerrado, 'emit');
    component.cancelar();
    expect(component.cerrado.emit).toHaveBeenCalled();
  });

  it('should not save with empty form', () => {
    spyOn(reportesService, 'crearReporte');
    component.guardar();
    expect(reportesService.crearReporte).not.toHaveBeenCalled();
  });

  it('should save when form is valid', () => {
    spyOn(reportesService, 'crearReporte');
    spyOn(component.cerrado, 'emit');

    component.titulo = 'Test Report';
    component.descripcion = 'Test Description';
    component.tipoReporte = 'casos';
    component.autor = 'Test Author';

    component.guardar();

    expect(reportesService.crearReporte).toHaveBeenCalled();
    expect(component.cerrado.emit).toHaveBeenCalled();
  });
});
