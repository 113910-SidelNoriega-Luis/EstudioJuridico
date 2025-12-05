import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

interface Consulta {
  id: number;
  categoria: string;
  asunto: string;
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'respondida' | 'cerrada';
  urgencia: 'baja' | 'media' | 'alta';
  respuesta?: {
    contenido: string;
    asesor: string;
    fecha: string;
  };
}



@Component({
  selector: 'app-consultas',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './consultas.html',
  styleUrl: './consultas.css',
})
export class Consultas implements OnInit {
  
  consultas: Consulta[] = [
    {
      id: 8,
      categoria: 'laboral',
      asunto: '¿Cómo proceder ante un despido injustificado?',
      descripcion: 'Fui despedido sin previo aviso después de 5 años trabajando en la empresa...',
      fecha: '20/11/2024 14:30',
      estado: 'pendiente',
      urgencia: 'alta'
    },
    {
      id: 7,
      categoria: 'familiar',
      asunto: 'Trámites para divorcio de mutuo acuerdo',
      descripcion: 'Mi esposa y yo hemos decidido divorciarnos de común acuerdo...',
      fecha: '18/11/2024 10:15',
      estado: 'respondida',
      urgencia: 'media',
      respuesta: {
        contenido: 'Para un divorcio de mutuo acuerdo sin hijos menores, necesitarán...',
        asesor: 'Dr. Carlos Rodríguez',
        fecha: '18/11/2024 16:45'
      }
    }
  ];

  stats = {
    total: 8,
    pendientes: 3,
    respondidas: 5
  };

  nuevaConsulta = {
    categoria: '',
    asunto: '',
    descripcion: '',
    urgencia: 'baja'
  };

  filtros = {
    busqueda: '',
    estado: 'todos',
    categoria: 'todos'
  };

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

  cargarConsultas() {
    // Aquí iría la llamada al servicio
  }

  enviarConsulta() {
  if (!this.nuevaConsulta.categoria || !this.nuevaConsulta.asunto || !this.nuevaConsulta.descripcion) {
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  const consulta: Consulta = {
    id: this.consultas.length + 1,
    categoria: this.nuevaConsulta.categoria,
    asunto: this.nuevaConsulta.asunto,
    descripcion: this.nuevaConsulta.descripcion,
    urgencia: this.nuevaConsulta.urgencia as 'baja' | 'media' | 'alta', // ← Cast explícito
    fecha: new Date().toLocaleString('es-AR'),
    estado: 'pendiente'
  };

  this.consultas.unshift(consulta);
  this.stats.total++;
  this.stats.pendientes++;

  alert('✅ ¡Consulta enviada exitosamente!');
  this.limpiarFormulario();
}

  limpiarFormulario() {
    this.nuevaConsulta = {
      categoria: '',
      asunto: '',
      descripcion: '',
      urgencia: 'baja'
    };
  }

  aplicarFiltros() {
    // Lógica de filtrado
    console.log('Aplicando filtros:', this.filtros);
  }

  getCategoriaClass(categoria: string): string {
    const clases: any = {
      'laboral': 'cat-laboral',
      'civil': 'cat-civil',
      'penal': 'cat-penal',
      'familiar': 'cat-familiar',
      'comercial': 'cat-comercial',
      'otro': 'cat-otro'
    };
    return clases[categoria] || 'cat-otro';
  }

  getCategoriaNombre(categoria: string): string {
    const nombres: any = {
      'laboral': 'Derecho Laboral',
      'civil': 'Derecho Civil',
      'penal': 'Derecho Penal',
      'familiar': 'Derecho Familiar',
      'comercial': 'Derecho Comercial',
      'otro': 'Otro'
    };
    return nombres[categoria] || 'Otro';
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      'pendiente': 'status-pendiente',
      'respondida': 'status-respondida',
      'cerrada': 'status-cerrada'
    };
    return clases[estado] || '';
  }

  verDetalles(id: number) {
    console.log('Ver detalles de consulta:', id);
    // Navegar a vista detallada
  }

  agendarTurno() {
    console.log('Agendar turno');
    // Navegar a turnos
  }
}
