import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';


interface Caso {
  id: number;
  numero: string;
  titulo: string;
  categoria: string;
  asesor: string;
  fechaInicio: string;
  fechaActualizacion: string;
  estado: 'proceso' | 'pendiente' | 'completado' | 'cerrado';
  progreso: number;
  documentos: number;
  descripcion: string;
  fechaFin?: string;
  actividades: Actividad[];
  proximasAcciones: ProximaAccion[];
}

interface Actividad {
  fecha: string;
  titulo: string;
  descripcion: string;
}

interface ProximaAccion {
  fecha: string;
  titulo: string;
  tipo: 'info' | 'warning' | 'danger';
}
@Component({
  selector: 'app-casos',
  imports: [CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './casos.html',
  styleUrl: './casos.css',
})
export class Casos implements OnInit {
  
  casosActivos: Caso[] = [
    {
      id: 1,
      numero: '2024-001',
      titulo: 'Despido Injustificado',
      categoria: 'laboral',
      asesor: 'Dra. María González',
      fechaInicio: '01/10/2024',
      fechaActualizacion: 'Hace 2 días',
      estado: 'proceso',
      progreso: 65,
      documentos: 12,
      descripcion: 'Caso de despido sin justa causa después de 5 años de antigüedad...',
      actividades: [
        {
          fecha: '18/11/2024',
          titulo: 'Presentación de Demanda',
          descripcion: 'Se presentó la demanda ante el juzgado laboral correspondiente.'
        },
        {
          fecha: '10/11/2024',
          titulo: 'Reunión de Estrategia',
          descripcion: 'Se definió la estrategia legal y se recopilaron todos los documentos necesarios.'
        }
      ],
      proximasAcciones: [
        { fecha: '25/11/2024', titulo: 'Audiencia Conciliatoria', tipo: 'info' },
        { fecha: 'Pendiente', titulo: 'Firma de documentación adicional', tipo: 'warning' }
      ]
    },
    {
      id: 2,
      numero: '2024-002',
      titulo: 'Divorcio de Mutuo Acuerdo',
      categoria: 'familiar',
      asesor: 'Dr. Carlos Rodríguez',
      fechaInicio: '15/10/2024',
      fechaActualizacion: 'Ayer',
      estado: 'proceso',
      progreso: 40,
      documentos: 8,
      descripcion: 'Trámite de divorcio consensuado sin hijos menores.',
      actividades: [],
      proximasAcciones: []
    },
    {
      id: 3,
      numero: '2024-003',
      titulo: 'Contrato de Alquiler - Cláusulas Abusivas',
      categoria: 'civil',
      asesor: 'Por asignar',
      fechaInicio: '18/11/2024',
      fechaActualizacion: 'Hoy',
      estado: 'pendiente',
      progreso: 10,
      documentos: 3,
      descripcion: 'Revisión de contrato de alquiler con cláusulas potencialmente abusivas.',
      actividades: [],
      proximasAcciones: []
    }
  ];

  casosCompletados: Caso[] = [
    {
      id: 4,
      numero: '2024-004',
      titulo: 'Sucesión Hereditaria',
      categoria: 'civil',
      asesor: 'Dr. Carlos Rodríguez',
      fechaInicio: '05/08/2024',
      fechaFin: '10/11/2024',
      fechaActualizacion: 'Completado',
      estado: 'completado',
      progreso: 100,
      documentos: 15,
      descripcion: 'Proceso de sucesión completo y documentación en regla.',
      actividades: [],
      proximasAcciones: []
    },
    {
      id: 5,
      numero: '2024-005',
      titulo: 'Reclamo de Seguros',
      categoria: 'comercial',
      asesor: 'Dra. María González',
      fechaInicio: '01/09/2024',
      fechaFin: '05/10/2024',
      fechaActualizacion: 'Completado',
      estado: 'completado',
      progreso: 100,
      documentos: 10,
      descripcion: 'Reclamo exitoso ante compañía de seguros.',
      actividades: [],
      proximasAcciones: []
    }
  ];

  stats = {
    total: 5,
    enProceso: 3,
    completados: 2
  };

  casoSeleccionado: Caso | null = null;
  usuario: any;
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
    
    if (!this.usuario) {
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getIniciales(nombre: string): string {
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return palabras[0][0] + palabras[1][0];
    }
    return palabras[0][0] + (palabras[0][1] || '');
  }

  cargarCasos() {
    // Aquí iría la llamada al servicio
  }

  verDetalleCaso(id: number) {
    const caso = [...this.casosActivos, ...this.casosCompletados].find(c => c.id === id);
    if (caso) {
      this.casoSeleccionado = caso;
      // Abrir modal usando Bootstrap
    }
  }

  getCategoriaClass(categoria: string): string {
    const clases: any = {
      'laboral': 'cat-laboral',
      'civil': 'cat-civil',
      'penal': 'cat-penal',
      'familiar': 'cat-familiar',
      'comercial': 'cat-comercial'
    };
    return clases[categoria] || 'cat-civil';
  }

  getCategoriaNombre(categoria: string): string {
    const nombres: any = {
      'laboral': 'Derecho Laboral',
      'civil': 'Derecho Civil',
      'penal': 'Derecho Penal',
      'familiar': 'Derecho Familiar',
      'comercial': 'Derecho Comercial'
    };
    return nombres[categoria] || 'Otro';
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      'proceso': 'status-proceso',
      'pendiente': 'status-pendiente',
      'completado': 'status-completado',
      'cerrado': 'status-cerrado'
    };
    return clases[estado] || '';
  }

  getEstadoNombre(estado: string): string {
    const nombres: any = {
      'proceso': 'En Proceso',
      'pendiente': 'Pendiente Asignación',
      'completado': 'Completado',
      'cerrado': 'Cerrado'
    };
    return nombres[estado] || estado;
  }

  getProgressBarClass(estado: string): string {
    if (estado === 'completado') return 'bg-success';
    if (estado === 'pendiente') return 'bg-warning';
    return 'bg-primary';
  }
}
