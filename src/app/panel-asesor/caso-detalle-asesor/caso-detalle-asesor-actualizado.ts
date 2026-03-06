// ============================================
// COMPONENTE DETALLE CASO ASESOR - CON API REAL
// ============================================
// Archivo: caso-detalle-asesor.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasoService, Caso, HabilitarPagoRequest } from '../../services/caso.service';

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
  selector: 'app-caso-detalle-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caso-detalle-asesor.component.html',
  styleUrls: ['./caso-detalle-asesor.component.css'],
})
export class CasoDetalleAsesorComponent implements OnInit, OnDestroy {
  caso: Caso | null = null;
  documentos: Documento[] = [];
  tabActiva: 'general' | 'documentos' = 'general';
  private refreshPagoInterval: ReturnType<typeof setInterval> | null = null;

  // Modal de documento
  mostrarModalDocumento: boolean = false;
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  descripcionArchivo: string = '';

  // Modal de pago
  mostrarModalPago: boolean = false;
  montoPago: number = 0;
  conceptoPago: string = '';
  procesandoPago: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casoService: CasoService,
  ) {}

  ngOnInit() {
    const casoId = Number(this.route.snapshot.params['id']);
    this.cargarCaso(casoId);
    this.cargarDocumentos(casoId);
    this.iniciarRefreshEstadoPago(casoId);
  }

  ngOnDestroy(): void {
    if (this.refreshPagoInterval) {
      clearInterval(this.refreshPagoInterval);
      this.refreshPagoInterval = null;
    }
  }

  cargarCaso(id: number) {
    this.casoService.obtenerCasoPorId(id).subscribe({
      next: (caso) => {
        this.caso = caso;
        this.sincronizarEstadoPago(id);
        console.log('✅ Caso cargado:', caso);
      },
      error: (error) => {
        console.error('❌ Error al cargar caso:', error);
        alert('Error al cargar el caso');
      },
    });
  }

  private iniciarRefreshEstadoPago(casoId: number): void {
    // Refresca el estado para reflejar pagos confirmados por webhook/callback.
    this.refreshPagoInterval = setInterval(() => {
      this.sincronizarEstadoPago(casoId);
    }, 8000);
  }

  private sincronizarEstadoPago(casoId: number): void {
    this.casoService.obtenerDatosPago(casoId).subscribe({
      next: (datosPago) => {
        if (!this.caso) {
          return;
        }

        const estadoPago = (datosPago.estadoPago || '').toLowerCase();
        const pagadoPorEstado =
          estadoPago === 'approved' ||
          estadoPago === 'paid' ||
          estadoPago === 'pagado' ||
          estadoPago === 'completed';

        this.caso.pagoHabilitado = !!datosPago.pagoHabilitado;
        this.caso.pagado = !!datosPago.pagado || pagadoPorEstado;
        this.caso.montoPago = datosPago.montoPago || this.caso.montoPago;
        this.caso.conceptoPago = datosPago.conceptoPago || this.caso.conceptoPago;
        this.caso.estadoPago = datosPago.estadoPago || this.caso.estadoPago;
      },
      error: () => {
        // Si falla esta consulta, mantenemos el estado actual sin romper la vista.
      },
    });
  }

  cargarDocumentos(casoId: number) {
    // TODO: Implementar carga de documentos desde el backend
    this.documentos = [
      {
        id: 1,
        nombre: 'Acta de Matrimonio.pdf',
        tipo: 'application/pdf',
        tamano: '2.5 MB',
        fecha: '2024-11-16',
        autor: 'María González',
        tipoAutor: 'cliente',
        url: '#',
      },
    ];
  }

  cambiarTab(tab: 'general' | 'documentos') {
    this.tabActiva = tab;
  }

  // ============================================
  // GESTIÓN DE DOCUMENTOS
  // ============================================

  abrirModalDocumento() {
    this.mostrarModalDocumento = true;
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.descripcionArchivo = '';
  }

  cerrarModalDocumento() {
    this.mostrarModalDocumento = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
    }
  }

  subirDocumento() {
    if (!this.archivoSeleccionado) {
      alert('Por favor selecciona un archivo');
      return;
    }

    // TODO: Implementar subida de documentos al backend
    const nuevoDocumento: Documento = {
      id: this.documentos.length + 1,
      nombre: this.nombreArchivo,
      tipo: this.archivoSeleccionado.type,
      tamano: (this.archivoSeleccionado.size / 1024 / 1024).toFixed(2) + ' MB',
      fecha: new Date().toISOString().split('T')[0],
      autor: this.caso?.asesor.name || 'Asesor',
      tipoAutor: 'asesor',
      url: '#',
    };

    this.documentos.unshift(nuevoDocumento);
    this.cerrarModalDocumento();
    alert('✅ Documento subido exitosamente');
  }

  descargarDocumento(documento: Documento) {
    console.log('Descargando:', documento.nombre);
    alert(`Descargando: ${documento.nombre}`);
  }

  eliminarDocumento(documentoId: number) {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      this.documentos = this.documentos.filter((d) => d.id !== documentoId);
      alert('✅ Documento eliminado');
    }
  }

  // ============================================
  // GESTIÓN DE PAGOS - CON API REAL
  // ============================================

  abrirModalPago() {
    if (this.caso) {
      this.mostrarModalPago = true;
      this.montoPago = this.caso.montoPago || 0;
      this.conceptoPago = this.caso.conceptoPago || '';
    }
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
  }

  habilitarPago() {
    if (this.montoPago <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    if (!this.conceptoPago.trim()) {
      alert('Por favor ingresa un concepto de pago');
      return;
    }

    if (!this.caso) return;

    this.procesandoPago = true;

    const request: HabilitarPagoRequest = {
      monto: this.montoPago,
      concepto: this.conceptoPago,
    };

    this.casoService.habilitarPago(this.caso.id, request).subscribe({
      next: (response) => {
        console.log('✅ Pago habilitado:', response);

        // Actualizar el caso localmente
        if (this.caso) {
          this.caso.pagoHabilitado = true;
          this.caso.montoPago = this.montoPago;
          this.caso.conceptoPago = this.conceptoPago;
          this.caso.preferenceId = response.preferenceId;
          this.caso.initPoint = response.initPoint;
        }

        this.cerrarModalPago();
        this.procesandoPago = false;

        alert('✅ Pago habilitado exitosamente. El cliente podrá realizar el pago desde su panel.');
      },
      error: (error) => {
        console.error('❌ Error al habilitar pago:', error);
        this.procesandoPago = false;
        alert('Error al habilitar el pago. Intenta nuevamente.');
      },
    });
  }

  deshabilitarPago() {
    if (!confirm('¿Estás seguro de deshabilitar el pago para este cliente?')) {
      return;
    }

    if (!this.caso) return;

    this.casoService.deshabilitarPago(this.caso.id).subscribe({
      next: () => {
        console.log('✅ Pago deshabilitado');

        if (this.caso) {
          this.caso.pagoHabilitado = false;
          this.caso.montoPago = 0;
          this.caso.conceptoPago = '';
        }

        alert('✅ Pago deshabilitado');
      },
      error: (error) => {
        console.error('❌ Error al deshabilitar pago:', error);
        alert('Error al deshabilitar el pago');
      },
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  getEstadoBadgeClass(): string {
    if (!this.caso) return 'bg-secondary';
    const classes: Record<string, string> = {
      activo: 'bg-success',
      pendiente: 'bg-warning',
      finalizado: 'bg-secondary',
    };
    return classes[this.caso.estado] || 'bg-secondary';
  }

  getPrioridadBadgeClass(): string {
    if (!this.caso) return 'bg-secondary';
    const classes: Record<string, string> = {
      alta: 'bg-danger',
      media: 'bg-warning',
      baja: 'bg-info',
    };
    if (!this.caso || !this.caso.prioridad) return 'bg-secondary';
    return classes[this.caso.prioridad.toLowerCase()] || 'bg-secondary';
  }

  getEstadoTexto(): string {
    if (!this.caso) return '';
    const textos: Record<string, string> = {
      activo: 'Activo',
      pendiente: 'Pendiente',
      finalizado: 'Finalizado',
    };
    return textos[this.caso.estado] || this.caso.estado;
  }

  getIconoTipoArchivo(tipo: string): string {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('docx')) return '📝';
    if (tipo.includes('excel') || tipo.includes('xlsx')) return '📊';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  }

  volverALista() {
    this.router.navigate(['/panel-asesor/casos']);
  }
}
