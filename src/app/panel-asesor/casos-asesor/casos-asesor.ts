import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Caso {
  id: number;
  titulo: string;
  cliente: {
    nombre: string;
    email: string;
  };
  tipo: string;
  estado: 'activo' | 'pendiente' | 'finalizado';
  fechaInicio: string;
  prioridad: 'alta' | 'media' | 'baja';
  pagoHabilitado: boolean;
  pagado: boolean;
  ultimaActualizacion: string;
}

@Component({
  selector: 'app-casos-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './casos-asesor.html',
  styleUrls: ['./casos-asesor.css']
})
export class CasosAsesorComponent implements OnInit {
  casos: Caso[] = [];
  casosFiltrados: Caso[] = [];
  busqueda: string = '';
  filtroEstado: string = 'todos';
  filtroPago: string = 'todos';

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarCasos();
  }

  cargarCasos() {
    // Simulación de datos - aquí conectarías con tu API
    this.casos = [
      {
        id: 1,
        titulo: 'Divorcio Express - Matrimonio González',
        cliente: {
          nombre: 'María González',
          email: 'maria.gonzalez@email.com'
        },
        tipo: 'Divorcio',
        estado: 'activo',
        fechaInicio: '2024-11-15',
        prioridad: 'alta',
        pagoHabilitado: true,
        pagado: true,
        ultimaActualizacion: '2024-12-05'
      },
      {
        id: 2,
        titulo: 'Sucesión - Bienes Rodríguez',
        cliente: {
          nombre: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com'
        },
        tipo: 'Sucesiones',
        estado: 'activo',
        fechaInicio: '2024-11-20',
        prioridad: 'media',
        pagoHabilitado: true,
        pagado: false,
        ultimaActualizacion: '2024-12-04'
      },
      {
        id: 3,
        titulo: 'Despido Laboral - Empresa TechCorp',
        cliente: {
          nombre: 'Ana Martínez',
          email: 'ana.martinez@email.com'
        },
        tipo: 'Laboral',
        estado: 'pendiente',
        fechaInicio: '2024-12-01',
        prioridad: 'alta',
        pagoHabilitado: false,
        pagado: false,
        ultimaActualizacion: '2024-12-03'
      },
      {
        id: 4,
        titulo: 'Contrato de Alquiler - Local Comercial',
        cliente: {
          nombre: 'Luis Fernández',
          email: 'luis.fernandez@email.com'
        },
        tipo: 'Contratos',
        estado: 'finalizado',
        fechaInicio: '2024-10-10',
        prioridad: 'baja',
        pagoHabilitado: true,
        pagado: true,
        ultimaActualizacion: '2024-11-30'
      }
    ];

    this.casosFiltrados = [...this.casos];
  }

  filtrarCasos() {
    this.casosFiltrados = this.casos.filter(caso => {
      const matchBusqueda = caso.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                           caso.cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                           caso.tipo.toLowerCase().includes(this.busqueda.toLowerCase());
      
      const matchEstado = this.filtroEstado === 'todos' || caso.estado === this.filtroEstado;
      
      let matchPago = true;
      if (this.filtroPago === 'habilitado') {
        matchPago = caso.pagoHabilitado;
      } else if (this.filtroPago === 'pagado') {
        matchPago = caso.pagado;
      } else if (this.filtroPago === 'pendiente') {
        matchPago = caso.pagoHabilitado && !caso.pagado;
      }
      
      return matchBusqueda && matchEstado && matchPago;
    });
  }

  verDetalle(casoId: number) {
    this.router.navigate(['/panel-asesor/caso', casoId]);
  }

  getEstadoBadgeClass(estado: string): string {
    const classes = {
      'activo': 'bg-success',
      'pendiente': 'bg-warning',
      'finalizado': 'bg-secondary'
    };
    return classes[estado as keyof typeof classes] || 'bg-secondary';
  }

  getPrioridadBadgeClass(prioridad: string): string {
    const classes = {
      'alta': 'bg-danger',
      'media': 'bg-warning',
      'baja': 'bg-info'
    };
    return classes[prioridad as keyof typeof classes] || 'bg-secondary';
  }

  getPagoBadgeClass(caso: Caso): string {
    if (caso.pagado) return 'bg-success';
    if (caso.pagoHabilitado) return 'bg-warning';
    return 'bg-secondary';
  }

  getPagoTexto(caso: Caso): string {
    if (caso.pagado) return 'Pagado';
    if (caso.pagoHabilitado) return 'Pendiente de Pago';
    return 'No Habilitado';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'activo': 'Activo',
      'pendiente': 'Pendiente',
      'finalizado': 'Finalizado'
    };
    return textos[estado as keyof typeof textos] || estado;
  }
}
