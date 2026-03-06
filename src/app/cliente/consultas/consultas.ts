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

declare const bootstrap: any;

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
      urgencia: 'alta',
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
        fecha: '18/11/2024 16:45',
      },
    },
  ];

  stats = {
    total: this.consultas.length,
    pendientes: this.consultas.filter((c) => c.estado === 'pendiente').length,
    respondidas: this.consultas.filter((c) => c.estado === 'respondida').length,
  };

  nuevaConsulta = {
    categoria: '',
    asunto: '',
    descripcion: '',
    urgencia: 'baja',
  };

  filtros = {
    busqueda: '',
    estado: 'todos',
    categoria: 'todos',
  };
  consultaDetalleSeleccionada: Consulta | null = null;

  usuario: any;

  constructor(
    private router: Router,
    private authService: AuthService,
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
    if (
      !this.nuevaConsulta.categoria ||
      !this.nuevaConsulta.asunto ||
      !this.nuevaConsulta.descripcion
    ) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const maxId = this.consultas.length > 0 ? Math.max(...this.consultas.map((c) => c.id)) : 0;

    const consulta: Consulta = {
      id: maxId + 1,
      categoria: this.nuevaConsulta.categoria,
      asunto: this.nuevaConsulta.asunto,
      descripcion: this.nuevaConsulta.descripcion,
      urgencia: this.nuevaConsulta.urgencia as 'baja' | 'media' | 'alta',
      fecha: new Date().toLocaleString('es-AR'),
      estado: 'pendiente',
    };

    this.consultas.unshift(consulta);
    this.actualizarStats();

    alert('✅ ¡Consulta enviada exitosamente!');
    this.limpiarFormulario();
    this.cerrarModalNuevaConsulta();
  }

  private cerrarModalNuevaConsulta(): void {
    const modalElement = document.getElementById('nuevaConsultaModal');
    if (!modalElement || typeof bootstrap === 'undefined') {
      return;
    }

    const instance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    instance.hide();
  }

  private actualizarStats(): void {
    this.stats.total = this.consultas.length;
    this.stats.pendientes = this.consultas.filter((c) => c.estado === 'pendiente').length;
    this.stats.respondidas = this.consultas.filter((c) => c.estado === 'respondida').length;
  }

  getConsultasFiltradas(): Consulta[] {
    const texto = this.filtros.busqueda.trim().toLowerCase();

    return this.consultas.filter((consulta) => {
      const coincideTexto =
        !texto ||
        consulta.asunto.toLowerCase().includes(texto) ||
        consulta.descripcion.toLowerCase().includes(texto);

      const coincideEstado =
        this.filtros.estado === 'todos' || consulta.estado === this.filtros.estado;

      const coincideCategoria =
        this.filtros.categoria === 'todos' || consulta.categoria === this.filtros.categoria;

      return coincideTexto && coincideEstado && coincideCategoria;
    });
  }

  limpiarFormulario() {
    this.nuevaConsulta = {
      categoria: '',
      asunto: '',
      descripcion: '',
      urgencia: 'baja',
    };
  }

  aplicarFiltros() {
    // Se mantiene para compatibilidad con el botón de filtrar.
    console.log('Aplicando filtros:', this.filtros);
  }

  getCategoriaClass(categoria: string): string {
    const clases: any = {
      laboral: 'cat-laboral',
      civil: 'cat-civil',
      penal: 'cat-penal',
      familiar: 'cat-familiar',
      comercial: 'cat-comercial',
      otro: 'cat-otro',
    };
    return clases[categoria] || 'cat-otro';
  }

  getCategoriaNombre(categoria: string): string {
    const nombres: any = {
      laboral: 'Derecho Laboral',
      civil: 'Derecho Civil',
      penal: 'Derecho Penal',
      familiar: 'Derecho Familiar',
      comercial: 'Derecho Comercial',
      otro: 'Otro',
    };
    return nombres[categoria] || 'Otro';
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      pendiente: 'status-pendiente',
      respondida: 'status-respondida',
      cerrada: 'status-cerrada',
    };
    return clases[estado] || '';
  }

  verDetalles(id: number) {
    const consulta = this.consultas.find((c) => c.id === id) || null;
    if (!consulta) {
      return;
    }

    this.consultaDetalleSeleccionada = consulta;
    this.abrirModalDetalleConsulta();
  }

  private abrirModalDetalleConsulta(): void {
    const modalElement = document.getElementById('detalleConsultaModal');
    if (!modalElement || typeof bootstrap === 'undefined') {
      return;
    }

    const instance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    instance.show();
  }

  agendarTurno() {
    console.log('Agendar turno');
    // Navegar a turnos
  }

  getIniciales(nombre: string): string {
    const palabras = nombre.trim().split(' ').filter(Boolean);
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }

    const primera = palabras[0] ?? 'U';
    return (primera[0] + (primera[1] || '')).toUpperCase();
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
