import { TestBed } from '@angular/core/testing';
import { ReportesService } from './reportes.service';

describe('ReportesService', () => {
  let service: ReportesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportesService],
    });

    service = TestBed.inject(ReportesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load datos on cargarDatos()', () => {
    service.cargarDatos();
    expect(service.datosPorMes().length).toBeGreaterThan(0);
    expect(service.cargando()).toBeFalse();
  });

  it('should return month data with obtenerMes()', () => {
    service.cargarDatos();
    const enero = service.obtenerMes(0, 2026);
    expect(enero).toBeDefined();
    expect(enero!.nombre).toBe('Enero');
  });

  it('should return undefined for missing month', () => {
    service.cargarDatos();
    const result = service.obtenerMes(5, 2026);
    expect(result).toBeUndefined();
  });
});
