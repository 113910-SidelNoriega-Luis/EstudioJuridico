# Módulo de Reportes

Este módulo gestiona la creación, visualización y descarga de reportes en la aplicación del Estudio Jurídico.

## Estructura de Carpetas

```
reportes/
├── reportes.ts                 # Componente principal de reportes
├── reportes.html              # Template del componente
├── reportes.css               # Estilos del componente
├── reportes.spec.ts           # Tests del componente
├── reportes.service.ts        # Servicio de reportes
├── reportes.service.spec.ts   # Tests del servicio
├── crear-reporte/            # Componente para crear nuevos reportes
│   ├── crear-reporte.ts
│   ├── crear-reporte.html
│   └── crear-reporte.css
└── README.md                  # Este archivo
```

## Componentes

### ReportesComponent

Componente principal que muestra la lista de reportes con filtros por tipo.

**Características:**

- Visualización de reportes en grid responsivo
- Filtrado por tipo (casos, clientes, finanzas, general)
- Descarga de reportes en múltiples formatos (PDF, Excel, CSV)
- Eliminación de reportes
- Interfaz intuitiva y moderna

**Uso:**

```typescript
import { ReportesComponent } from './reportes/reportes';

// En tu rutas
const routes: Routes = [
  {
    path: 'reportes',
    component: ReportesComponent,
  },
];
```

### CrearReporteComponent

Componente modal para crear nuevos reportes.

**Características:**

- Formulario con validación
- Selección de tipo de reporte
- Captura de información del autor

**Uso:**

```typescript
import { CrearReporteComponent } from './reportes/crear-reporte/crear-reporte';

// Usar dentro de otro componente
@Component({
  imports: [CrearReporteComponent],
  template: `
    @if (mostrarFormulario()) {
      <app-crear-reporte (cerrado)="cerrarFormulario()" />
    }
  `
})
```

## Servicio

### ReportesService

Servicio encargado de gestionar todas las operaciones relacionadas con reportes.

**Métodos principales:**

- `cargarReportes()`: Carga todos los reportes del servidor
- `crearReporte(reporte)`: Crea un nuevo reporte
- `actualizarReporte(id, cambios)`: Actualiza un reporte existente
- `eliminarReporte(id)`: Elimina un reporte
- `descargarReporte(id, formato)`: Descarga un reporte en el formato especificado

**Signals:**

- `reportes`: Señal que contiene el array de reportes
- `cargando`: Señal que indica si se está cargando
- `error`: Señal que contiene mensajes de error

**Uso:**

```typescript
import { ReportesService } from './reportes/reportes.service';

export class MiComponente {
  private reportesService = inject(ReportesService);

  reportes = computed(() => this.reportesService.reportes());
  cargando = computed(() => this.reportesService.cargando());

  crearReporte() {
    this.reportesService.crearReporte({
      titulo: 'Mi Reporte',
      descripcion: 'Descripción del reporte',
      tipo: 'casos',
      autor: 'Mi Nombre',
      datos: [],
    });
  }
}
```

## Tipos de Reportes

La aplicación soporta 4 tipos de reportes:

1. **casos**: Reportes sobre casos legales
2. **clientes**: Reportes sobre información de clientes
3. **finanzas**: Reportes financieros y de pagos
4. **general**: Reportes generales

## API Esperada

El servicio espera que el backend implemente los siguientes endpoints:

- `GET /reportes` - Obtener todos los reportes
- `POST /reportes` - Crear un nuevo reporte
- `PUT /reportes/:id` - Actualizar un reporte
- `DELETE /reportes/:id` - Eliminar un reporte
- `GET /reportes/:id/descargar?formato=pdf` - Descargar reporte en formato especificado

## Estilos

Los estilos están incluidos en los archivos `.css` correspondientes. El diseño es:

- **Responsivo**: Se adapta a dispositivos móviles
- **Moderno**: Utiliza colores y efectos visuales modernos
- **Accesible**: Cumple con estándares de accesibilidad

## Validaciones

### CrearReporteComponent

- Título requerido (no vacío)
- Descripción requerida (no vacía)
- Tipo de reporte requerido
- Autor requerido (no vacío)

## Ejemplo Completo de Integración

```typescript
import { Component, signal } from '@angular/core';
import { ReportesComponent } from './reportes/reportes';
import { CrearReporteComponent } from './reportes/crear-reporte/crear-reporte';

@Component({
  selector: 'app-mis-reportes',
  standalone: true,
  imports: [ReportesComponent, CrearReporteComponent],
  template: `
    <div class="contenedor">
      <app-reportes />

      @if (mostrarCrearReporte()) {
        <app-crear-reporte (cerrado)="onReporteCerrado()" />
      }
    </div>
  `,
})
export class MisReportesComponent {
  mostrarCrearReporte = signal(false);

  onReporteCerrado() {
    this.mostrarCrearReporte.set(false);
  }
}
```

## Testing

Ambos componentes y el servicio incluyen tests básicos. Para ejecutarlos:

```bash
npm test
```

## Mejoras Futuras

- [ ] Filtado y búsqueda avanzada
- [ ] Gráficos y visualizaciones en reportes
- [ ] Programación de reportes automáticos
- [ ] Exportación a múltiples formatos adicionales
- [ ] Compartir reportes con otros usuarios
- [ ] Historial de reportes generados
- [ ] Presets de reportes comunes
