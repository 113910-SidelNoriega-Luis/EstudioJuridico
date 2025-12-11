// caso-detalle-cliente.ts - COMPONENTE CORREGIDO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoService,Caso,DatosPago } from '../services/caso.service';

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  tamano: string;
  fecha: string;
  autor: string;
  tipoAutor: 'asesor' | 'cliente';
  url?: string;
}

@Component({
  selector: 'app-caso-detalle-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caso-detalle-cliente.component.html',
  styleUrls: ['./caso-detalle-cliente.component.css']
})
export class CasoDetalleClienteComponent implements OnInit {
  caso: Caso | null = null;
  documentos: Documento[] = [];
  tabActiva: 'general' | 'documentos' = 'general';
  procesandoPago: boolean = false;
  datosPago: DatosPago | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casosService: CasoService
  ) {}

  ngOnInit() {
    // ✅ Si no hay ID en la ruta, usa 1 por defecto
    const casoId = this.route.snapshot.params['id'] 
      ? Number(this.route.snapshot.params['id']) 
      : 1;
    
    console.log('🔍 Cargando caso ID:', casoId);
    
    this.cargarCaso(casoId);
    this.cargarDocumentos(casoId);
    this.cargarDatosPago(casoId);
  }

  cargarCaso(id: number) {
    console.log('📡 Llamando al backend para caso:', id);
    
    this.casosService.obtenerCasoPorId(id).subscribe({
      next: (caso: Caso) => {
        this.caso = caso;
        console.log('✅ Caso cargado exitosamente:', caso);
      },
      error: (error: any) => {
        console.error('❌ Error al cargar caso:', error);
        console.error('Detalle del error:', error.message);
        alert('Error al cargar el caso. Revisa la consola para más detalles.');
      }
    });
  }

  cargarDocumentos(casoId: number) {
    // TODO: Implementar carga de documentos desde el backend
    this.documentos = [
      {
        id: 1,
        nombre: 'Carta Documento.pdf',
        tipo: 'application/pdf',
        tamano: '2.5 MB',
        fecha: '2024-11-16',
        autor: 'Dra. María González',
        tipoAutor: 'asesor',
        url: '#'
      },
      {
        id: 2,
        nombre: 'Recibos de Sueldo.pdf',
        tipo: 'application/pdf',
        tamano: '1.2 MB',
        fecha: '2024-11-20',
        autor: 'Juan Pérez',
        tipoAutor: 'cliente',
        url: '#'
      }
    ];
  }

  cargarDatosPago(casoId: number) {
    this.casosService.obtenerDatosPago(casoId).subscribe({
      next: (datos: DatosPago) => {
        this.datosPago = datos;
        console.log('✅ Datos de pago cargados:', datos);
      },
      error: (error: any) => {
        console.error('⚠️ No hay datos de pago disponibles:', error);
        // No mostramos alerta porque es normal que no haya pago habilitado
      }
    });
  }

  cambiarTab(tab: 'general' | 'documentos') {
    this.tabActiva = tab;
  }

  // ============================================
  // MERCADO PAGO - FLUJO DE PAGO
  // ============================================
  
  pagarConMercadoPago() {
    if (!this.caso || !this.caso.initPoint || this.procesandoPago) {
      console.warn('⚠️ No se puede procesar el pago:', {
        casoExiste: !!this.caso,
        tieneInitPoint: !!this.caso?.initPoint,
        estaProcesando: this.procesandoPago
      });
      return;
    }

    this.procesandoPago = true;

    console.log('💳 Redirigiendo a Mercado Pago...');
    console.log('Init Point:', this.caso.initPoint);

    // Redirigir al checkout de Mercado Pago
    window.location.href = this.caso.initPoint;
  }

  // ============================================
  // GESTIÓN DE DOCUMENTOS
  // ============================================
  
  descargarDocumento(documento: Documento) {
    console.log('📥 Descargando:', documento.nombre);
    alert(`Descargando: ${documento.nombre}`);
  }

  // ============================================
  // HELPERS
  // ============================================
  
  getEstadoBadgeClass(): string {
    if (!this.caso) return 'bg-secondary';
    const classes: Record<string, string> = {
      'activo': 'bg-success',
      'en_proceso': 'bg-primary',
      'pendiente': 'bg-warning',
      'finalizado': 'bg-secondary',
      'completado': 'bg-success'
    };
    return classes[this.caso.estado.toLowerCase()] || 'bg-secondary';
  }

  getPrioridadBadgeClass(): string {
    if (!this.caso || !this.caso.prioridad) return 'bg-secondary';
    const classes: Record<string, string> = {
      'alta': 'bg-danger',
      'media': 'bg-warning',
      'baja': 'bg-info'
    };
    return classes[this.caso.prioridad.toLowerCase()] || 'bg-secondary';
  }

  getEstadoTexto(): string {
    if (!this.caso) return '';
    const textos: Record<string, string> = {
      'activo': 'Activo',
      'en_proceso': 'En Proceso',
      'pendiente': 'Pendiente',
      'finalizado': 'Finalizado',
      'completado': 'Completado'
    };
    return textos[this.caso.estado.toLowerCase()] || this.caso.estado;
  }

  getIconoTipoArchivo(tipo: string): string {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('docx')) return '📝';
    if (tipo.includes('excel') || tipo.includes('xlsx')) return '📊';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  }

  formatearFecha(fecha: number[] | string | null | undefined): string {
    if (!fecha) return 'N/A';
    
    if (Array.isArray(fecha)) {
      // Formato del backend: [año, mes, día, hora, minuto]
      const [year, month, day] = fecha;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
    
    // Si es string, devolverla tal cual
    return fecha;
  }

  volverAMisCasos() {
    this.router.navigate(['/panel-cliente']);
  }

  contactarAsesor() {
    if (this.caso && this.caso.asesor) {
      const email = this.caso.asesor.email || 'contacto@estudiojuridico.com';
      window.location.href = `mailto:${email}`;
    }
  }
}
