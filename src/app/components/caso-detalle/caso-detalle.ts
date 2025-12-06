import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasosService, Caso, Documento } from '../../services/casos.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-caso-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caso-detalle.html',
  styleUrls: ['./caso-detalle.css']
})
export class CasoDetalleComponent implements OnInit {
  casoId: number = 0;
  caso: Caso | undefined;
  tipoUsuario: 'cliente' | 'asesor' = 'asesor'; // Cambiar según usuario logueado
  
  // Para modales
  mostrarModalPago = false;
  mostrarModalDocumento = false;
  mostrarModalPlantilla = false;
  
  // Para documentos
  archivoSeleccionado: File | null = null;
  nombreDocumento = '';
  
  // Para plantillas
  plantillaSeleccionada = '';
  plantillasDisponibles = [
    { id: 'demanda_laboral', nombre: 'Demanda Laboral', tipo: 'Laboral' },
    { id: 'contestacion_demanda', nombre: 'Contestación de Demanda', tipo: 'General' },
    { id: 'escrito_agrega', nombre: 'Escrito que AGREGA', tipo: 'Judicial' },
    { id: 'poder_especial', nombre: 'Poder Especial', tipo: 'Notarial' },
    { id: 'carta_documento', nombre: 'Carta Documento', tipo: 'Notificación' }
  ];

  // Tabs
  tabActiva: 'info' | 'documentos' | 'pago' | 'historial' = 'info';

  // Estado de carga
  cargandoPago = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casosService: CasosService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    // Obtener ID del caso
    this.casoId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Obtener tipo de usuario (simular login)
    this.tipoUsuario = localStorage.getItem('tipoUsuario') as 'cliente' | 'asesor' || 'asesor';
    
    // Cargar caso
    this.cargarCaso();
  }

  cargarCaso() {
    this.caso = this.casosService.getCasoById(this.casoId);
    if (!this.caso) {
      alert('Caso no encontrado');
      this.volver();
    }
  }

  // === NAVEGACIÓN ===
  cambiarTab(tab: 'info' | 'documentos' | 'pago' | 'historial') {
    this.tabActiva = tab;
  }

  volver() {
    if (this.tipoUsuario === 'cliente') {
      this.router.navigate(['/cliente/casos']);
    } else {
      this.router.navigate(['/asesor/casos']);
    }
  }

  // === DOCUMENTOS (ASESOR) ===
  abrirModalDocumento() {
    this.mostrarModalDocumento = true;
  }

  cerrarModalDocumento() {
    this.mostrarModalDocumento = false;
    this.archivoSeleccionado = null;
    this.nombreDocumento = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreDocumento = file.name;
    }
  }

  subirDocumento() {
    if (!this.archivoSeleccionado || !this.caso) return;

    const nuevoDocumento: Documento = {
      id: Date.now(),
      nombre: this.nombreDocumento,
      tipo: 'documento',
      tamano: (this.archivoSeleccionado.size / 1024).toFixed(0) + ' KB',
      fecha: new Date().toLocaleDateString('es-AR'),
      autor: this.caso.asesor.nombre
    };

    this.casosService.agregarDocumento(this.casoId, nuevoDocumento);
    this.cargarCaso();
    this.cerrarModalDocumento();
    alert('Documento subido correctamente');
  }

  eliminarDocumento(documento: Documento) {
    if (!this.caso) return;
    
    if (confirm(`¿Está seguro de eliminar "${documento.nombre}"?`)) {
      this.casosService.eliminarDocumento(this.casoId, documento.id);
      this.cargarCaso();
      alert('Documento eliminado');
    }
  }

  // === PLANTILLAS (ASESOR) ===
  abrirModalPlantilla() {
    this.mostrarModalPlantilla = true;
  }

  cerrarModalPlantilla() {
    this.mostrarModalPlantilla = false;
    this.plantillaSeleccionada = '';
  }

  guardarPlantilla() {
    if (!this.plantillaSeleccionada || !this.caso) return;

    const plantilla = this.plantillasDisponibles.find(p => p.id === this.plantillaSeleccionada);
    if (!plantilla) return;

    const nuevaPlantilla: Documento = {
      id: Date.now(),
      nombre: `${plantilla.nombre}.docx`,
      tipo: 'plantilla',
      tamano: '45 KB',
      fecha: new Date().toLocaleDateString('es-AR'),
      autor: this.caso.asesor.nombre
    };

    this.casosService.agregarDocumento(this.casoId, nuevaPlantilla);
    this.cargarCaso();
    this.cerrarModalPlantilla();
    alert(`Plantilla "${plantilla.nombre}" agregada correctamente`);
  }

  // === PAGO (ASESOR) ===
  habilitarPago() {
    if (!this.caso) return;
    
    if (confirm('¿Habilitar pago para este caso?')) {
      this.casosService.habilitarPago(this.casoId);
      this.cargarCaso();
      alert('Pago habilitado. El cliente ya puede realizar el pago.');
    }
  }

  // === PAGO (CLIENTE) ===
  abrirModalPago() {
    if (!this.caso?.pagoHabilitado) {
      alert('El pago no está habilitado para este caso');
      return;
    }
    this.mostrarModalPago = true;
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
  }

  procesarPagoMercadoPago() {
    if (!this.caso) return;

    this.cargandoPago = true;

    // Llamar al backend REAL de Mercado Pago
    this.paymentService.crearPreferenciaPago(
      this.caso.id,
      this.caso.titulo,
      this.caso.cliente.nombre
    ).subscribe({
      next: (response) => {
        console.log('Preferencia creada:', response);
        
        // Redirigir a Mercado Pago (usar sandbox en desarrollo)
        window.location.href = response.sandboxInitPoint || response.initPoint;
      },
      error: (error) => {
        console.error('Error al crear preferencia:', error);
        this.cargandoPago = false;
        alert('Error al procesar el pago. Intente nuevamente.');
      }
    });
  }

  // === UTILIDADES ===
  getEstadoBadgeClass(): string {
    if (!this.caso) return '';
    
    switch (this.caso.estado) {
      case 'activo': return 'bg-success';
      case 'en_proceso': return 'bg-warning';
      case 'pagado': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getEstadoTexto(): string {
    if (!this.caso) return '';
    
    switch (this.caso.estado) {
      case 'activo': return 'Activo';
      case 'en_proceso': return 'En Proceso';
      case 'pagado': return '✓ Pagado';
      default: return '';
    }
  }

  getMovimientoIcon(tipo: string): string {
    switch (tipo) {
      case 'actualizacion': return '🔄';
      case 'documento': return '📄';
      case 'pago': return '💰';
      case 'nota': return '📝';
      default: return '•';
    }
  }

  getDocumentoIcon(tipo: string): string {
    return tipo === 'plantilla' ? '📋' : '📄';
  }
}
