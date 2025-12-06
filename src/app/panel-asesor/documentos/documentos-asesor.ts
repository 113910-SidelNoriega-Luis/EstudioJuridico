import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../auth/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';

// Interfaces
interface Documento {
  id: number;
  nombre: string;
  tipo: 'pdf' | 'doc' | 'img' | 'escrito';
  extension: string;
  tamanio: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  caso?: string;
  casoNumero?: string;
  descripcion?: string;
  contenido?: string;
  creadoPor?: string;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  casosActivos: number;
  documentos: number;
}

interface Caso {
  id: string;
  numero: string;
  titulo: string;
  clienteId: string;
  clienteNombre: string;
}

interface Plantilla {
  id: string;
  nombre: string;
  tipo: string;
  icono: string;
  descripcion: string;
  contenido: string;
  vecesUsada?: number;
}

interface Actividad {
  icono: string;
  titulo: string;
  detalle: string;
  fecha: string;
}

@Component({
  selector: 'app-documentos-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos-asesor.html',
  styleUrls: ['./documentos-asesor.css']
})
export class DocumentosAsesorComponent implements OnInit {

  @ViewChild('editorContent') editorContent!: ElementRef;

  usuario: Usuario | null = null;
  tabActivo: 'todos' | 'porCliente' | 'nuevoEscrito' | 'subirDoc' | 'plantillas' = 'todos';

  estadisticas = {
    totalDocumentos: 45,
    escritosCreados: 18,
    clientesConDocs: 12,
    plantillasActivas: 8
  };

  filtros = { busqueda: '', tipo: 'todos', cliente: 'todos', caso: 'todos' };
  ordenActual = 'fecha';
  ordenAsc = false;

  clientes: Cliente[] = [
    { id: '1', nombre: 'Juan Pérez', email: 'juan@email.com', casosActivos: 2, documentos: 8 },
    { id: '2', nombre: 'María González', email: 'maria@email.com', casosActivos: 1, documentos: 5 },
    { id: '3', nombre: 'Carlos Ramírez', email: 'carlos@email.com', casosActivos: 1, documentos: 6 },
    { id: '4', nombre: 'Ana Martínez', email: 'ana@email.com', casosActivos: 2, documentos: 10 }
  ];

  clienteSeleccionado: Cliente | null = null;
  busquedaCliente = '';

  casos: Caso[] = [
    { id: '2024-001', numero: '2024-001', titulo: 'Despido Injustificado', clienteId: '1', clienteNombre: 'Juan Pérez' },
    { id: '2024-002', numero: '2024-002', titulo: 'Divorcio Mutuo Acuerdo', clienteId: '2', clienteNombre: 'María González' },
    { id: '2024-003', numero: '2024-003', titulo: 'Contrato Alquiler', clienteId: '1', clienteNombre: 'Juan Pérez' },
    { id: '2024-004', numero: '2024-004', titulo: 'Sucesión', clienteId: '3', clienteNombre: 'Carlos Ramírez' },
    { id: '2024-005', numero: '2024-005', titulo: 'Accidente Laboral', clienteId: '4', clienteNombre: 'Ana Martínez' }
  ];

  documentos: Documento[] = [
    { id: 1, nombre: 'Escrito AGREGA - Documentación Laboral', tipo: 'escrito', extension: 'DOC', tamanio: '45 KB', fecha: '20/11/2024', clienteId: '1', clienteNombre: 'Juan Pérez', caso: '2024-001', creadoPor: 'Dra. María González' },
    { id: 2, nombre: 'Contrato de Trabajo', tipo: 'pdf', extension: 'PDF', tamanio: '1.2 MB', fecha: '18/11/2024', clienteId: '1', clienteNombre: 'Juan Pérez', caso: '2024-001' },
    { id: 3, nombre: 'DNI Frente y Dorso', tipo: 'img', extension: 'JPG', tamanio: '2.5 MB', fecha: '15/11/2024', clienteId: '1', clienteNombre: 'Juan Pérez', caso: '2024-001' },
    { id: 4, nombre: 'Convenio Regulador', tipo: 'pdf', extension: 'PDF', tamanio: '890 KB', fecha: '14/11/2024', clienteId: '2', clienteNombre: 'María González', caso: '2024-002' },
    { id: 5, nombre: 'Escrito SOLICITA - Audiencia', tipo: 'escrito', extension: 'DOC', tamanio: '38 KB', fecha: '12/11/2024', clienteId: '2', clienteNombre: 'María González', caso: '2024-002', creadoPor: 'Dr. Carlos Rodríguez' },
    { id: 6, nombre: 'Testamento Original', tipo: 'pdf', extension: 'PDF', tamanio: '1.8 MB', fecha: '10/11/2024', clienteId: '3', clienteNombre: 'Carlos Ramírez', caso: '2024-004' },
    { id: 7, nombre: 'Informe Médico', tipo: 'pdf', extension: 'PDF', tamanio: '2.1 MB', fecha: '08/11/2024', clienteId: '4', clienteNombre: 'Ana Martínez', caso: '2024-005' }
  ];

  documentosFiltrados: Documento[] = [];

  actividadReciente: Actividad[] = [
    { icono: '📤', titulo: 'Documento subido', detalle: 'Contrato de Trabajo - Juan Pérez', fecha: 'Hace 2 horas' },
    { icono: '📝', titulo: 'Escrito creado', detalle: 'AGREGA documentación - María González', fecha: 'Hace 4 horas' },
    { icono: '👁️', titulo: 'Documento visualizado', detalle: 'DNI - Carlos Ramírez', fecha: 'Ayer' }
  ];

  isDragging = false;
  archivosSeleccionados: File[] = [];
  uploadConfig = { clienteId: '', casoId: '', descripcion: '' };

  nuevoEscrito = { clienteId: '', casoId: '', caratula: '', tipo: '', plantillaId: '', contenido: '' };

  tiposEscrito = [
    { value: 'agrega', label: 'AGREGA' },
    { value: 'contesta', label: 'CONTESTA DEMANDA' },
    { value: 'solicita', label: 'SOLICITA' },
    { value: 'acredita', label: 'ACREDITA' },
    { value: 'apela', label: 'APELA' },
    { value: 'ofrece', label: 'OFRECE PRUEBA' }
  ];

  variablesDisponibles = ['[Quien_Suscribe]', '[CARATULA]', '[FECHA]', '[EXPEDIENTE]', '[CLIENTE]', '[CASO_NUMERO]'];

  plantillas: Plantilla[] = [
    { id: 'agrega', nombre: 'AGREGA Documentación', tipo: 'agrega', icono: '📎', descripcion: 'Para agregar documentación al expediente', contenido: '<p><strong>Señor/a Juez:</strong></p><p>[Quien_Suscribe], en estos autos caratulados "[CARATULA]", comparezco y DIGO:</p><p>Que acompaño a estos obrados la siguiente documentación:</p><ul><li>_______________</li></ul><p>Por lo expuesto solicito: Agréguese lo acompañado.</p><p><strong>Es justicia.</strong></p>', vecesUsada: 25 },
    { id: 'solicita', nombre: 'SOLICITA', tipo: 'solicita', icono: '📝', descripcion: 'Para realizar solicitudes al juzgado', contenido: '<p><strong>Señor/a Juez:</strong></p><p>[Quien_Suscribe], en los autos caratulados "[CARATULA]", a V.S. respetuosamente digo:</p><p>Que vengo por el presente a solicitar a V.S.:</p><p>_______________________________________________</p><p><strong>PETITORIO:</strong></p><p>Por lo expuesto, solicito a V.S.:</p><p>1. Tenga por presentado el presente escrito.</p><p>2. Haga lugar a lo peticionado.</p><p><strong>Provea V.S. de conformidad que será justicia.</strong></p>', vecesUsada: 18 },
    { id: 'apela', nombre: 'APELA', tipo: 'apela', icono: '⚖️', descripcion: 'Para interponer recurso de apelación', contenido: '<p><strong>Señor/a Juez:</strong></p><p>[Quien_Suscribe], en los autos caratulados "[CARATULA]", a V.S. respetuosamente digo:</p><p>Que vengo en tiempo y forma a interponer <strong>RECURSO DE APELACIÓN</strong> contra la resolución de fecha _________.</p><p><strong>PETITORIO:</strong></p><p>Solicito se conceda el recurso y se eleven las actuaciones al Superior.</p><p><strong>Será justicia.</strong></p>', vecesUsada: 8 }
  ];

  plantillaSeleccionada: Plantilla | null = null;
  mostrarModalPreview = false;
  documentoPreview = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
    if (!this.usuario || !this.authService.esAsesor()) {
      this.router.navigate(['/inicio']);
      return;
    }
    this.documentosFiltrados = [...this.documentos];
  }

  volverDashboard(): void { this.router.navigate(['/panel-asesor']); }
  cerrarSesion(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  cambiarTab(tab: 'todos' | 'porCliente' | 'nuevoEscrito' | 'subirDoc' | 'plantillas'): void {
    this.tabActivo = tab;
    window.scrollTo(0, 0);
  }

  filtrarDocumentos(): void {
    this.documentosFiltrados = this.documentos.filter(doc => {
      const matchBusqueda = this.filtros.busqueda === '' || doc.nombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase()) || doc.clienteNombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase());
      const matchTipo = this.filtros.tipo === 'todos' || doc.tipo === this.filtros.tipo;
      const matchCliente = this.filtros.cliente === 'todos' || doc.clienteId === this.filtros.cliente;
      const matchCaso = this.filtros.caso === 'todos' || doc.caso === this.filtros.caso;
      return matchBusqueda && matchTipo && matchCliente && matchCaso;
    });
  }

  limpiarFiltros(): void {
    this.filtros = { busqueda: '', tipo: 'todos', cliente: 'todos', caso: 'todos' };
    this.filtrarDocumentos();
  }

  ordenarPor(campo: string): void {
    if (this.ordenActual === campo) { this.ordenAsc = !this.ordenAsc; }
    else { this.ordenActual = campo; this.ordenAsc = true; }
    this.documentosFiltrados.sort((a, b) => {
      let valorA = campo === 'cliente' ? a.clienteNombre : campo === 'tipo' ? a.tipo : a.fecha;
      let valorB = campo === 'cliente' ? b.clienteNombre : campo === 'tipo' ? b.tipo : b.fecha;
      return this.ordenAsc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    });
  }

  getIconoTipo(tipo: string): string {
    return { 'pdf': '📕', 'doc': '📘', 'img': '🖼️', 'escrito': '📝' }[tipo] || '📄';
  }

  getIniciales(nombre: string): string {
    const palabras = nombre.split(' ');
    return palabras.length >= 2 ? palabras[0][0] + palabras[1][0] : nombre.substring(0, 2).toUpperCase();
  }

  getTipoArchivo(nombre: string): string {
    const ext = nombre.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'img';
    return 'doc';
  }

  formatearTamanio(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getClientesFiltrados(): Cliente[] {
    return !this.busquedaCliente ? this.clientes : this.clientes.filter(c => c.nombre.toLowerCase().includes(this.busquedaCliente.toLowerCase()));
  }

  seleccionarCliente(cliente: Cliente): void { this.clienteSeleccionado = cliente; }
  getDocumentosCliente(): Documento[] { return this.clienteSeleccionado ? this.documentos.filter(d => d.clienteId === this.clienteSeleccionado!.id) : []; }
  getCasosCliente(): Caso[] { return this.clienteSeleccionado ? this.casos.filter(c => c.clienteId === this.clienteSeleccionado!.id) : []; }
  getDocumentosCaso(casoId: string): Documento[] { return this.getDocumentosCliente().filter(d => d.caso === casoId); }
  getDocumentosSinCaso(): Documento[] { return this.getDocumentosCliente().filter(d => !d.caso); }

  subirDocumentoCliente(): void {
    if (this.clienteSeleccionado) { this.uploadConfig.clienteId = this.clienteSeleccionado.id; this.cambiarTab('subirDoc'); }
  }

  crearEscritoCliente(): void {
    if (this.clienteSeleccionado) { this.nuevoEscrito.clienteId = this.clienteSeleccionado.id; this.cambiarTab('nuevoEscrito'); }
  }

  verDocumento(doc: Documento): void {
    this.documentoPreview = doc.contenido || `<div style="text-align:center;padding:50px;"><div style="font-size:64px;">${this.getIconoTipo(doc.tipo)}</div><h4>${doc.nombre}</h4><p>Cliente: ${doc.clienteNombre}</p><p>${doc.extension} | ${doc.tamanio} | ${doc.fecha}</p></div>`;
    this.mostrarModalPreview = true;
  }

  descargarDocumento(doc: Documento): void { this.notificacionesService.mostrarNotificacion(`⬇️ Descargando ${doc.nombre}...`, 'info'); }

  editarDocumento(doc: Documento): void {
    if (doc.tipo === 'escrito' && doc.contenido) {
      this.nuevoEscrito.contenido = doc.contenido;
      this.nuevoEscrito.clienteId = doc.clienteId;
      this.nuevoEscrito.casoId = doc.caso || '';
      this.cambiarTab('nuevoEscrito');
    }
  }

  eliminarDocumento(doc: Documento): void {
    if (confirm(`¿Eliminar "${doc.nombre}"?`)) {
      this.documentos = this.documentos.filter(d => d.id !== doc.id);
      this.filtrarDocumentos();
      this.estadisticas.totalDocumentos--;
      this.notificacionesService.mostrarNotificacion('🗑️ Documento eliminado', 'success');
    }
  }

  asignarCaso(doc: Documento): void { alert('Funcionalidad para asignar caso'); }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragging = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.isDragging = false; }
  onDrop(event: DragEvent): void { event.preventDefault(); this.isDragging = false; if (event.dataTransfer?.files) this.procesarArchivos(event.dataTransfer.files); }
  onFileSelected(event: Event): void { const input = event.target as HTMLInputElement; if (input.files) this.procesarArchivos(input.files); }

  procesarArchivos(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      if (files[i].size <= 10 * 1024 * 1024) this.archivosSeleccionados.push(files[i]);
      else this.notificacionesService.mostrarNotificacion(`❌ ${files[i].name} excede 10MB`, 'error');
    }
  }

  removerArchivo(index: number): void { this.archivosSeleccionados.splice(index, 1); }
  onClienteUploadChange(): void { this.uploadConfig.casoId = ''; }
  getCasosClienteUpload(): Caso[] { return this.casos.filter(c => c.clienteId === this.uploadConfig.clienteId); }

  subirArchivos(): void {
    if (!this.uploadConfig.clienteId) { this.notificacionesService.mostrarNotificacion('❌ Selecciona un cliente', 'error'); return; }
    const cliente = this.clientes.find(c => c.id === this.uploadConfig.clienteId);
    this.archivosSeleccionados.forEach((archivo, i) => {
      this.documentos.unshift({
        id: this.documentos.length + i + 1, nombre: archivo.name.replace(/\.[^/.]+$/, ''),
        tipo: this.getTipoArchivo(archivo.name) as any, extension: archivo.name.split('.').pop()?.toUpperCase() || '',
        tamanio: this.formatearTamanio(archivo.size), fecha: new Date().toLocaleDateString('es-AR'),
        clienteId: this.uploadConfig.clienteId, clienteNombre: cliente?.nombre || '',
        caso: this.uploadConfig.casoId || undefined, creadoPor: this.usuario?.nombre
      });
    });
    this.estadisticas.totalDocumentos += this.archivosSeleccionados.length;
    this.notificacionesService.mostrarNotificacion(`✅ ${this.archivosSeleccionados.length} archivo(s) subido(s)`, 'success');
    this.archivosSeleccionados = [];
    this.uploadConfig = { clienteId: '', casoId: '', descripcion: '' };
    this.filtrarDocumentos();
    this.cambiarTab('todos');
  }

  onClienteEscritoChange(): void { this.nuevoEscrito.casoId = ''; this.nuevoEscrito.caratula = ''; }
  getCasosClienteEscrito(): Caso[] { return this.casos.filter(c => c.clienteId === this.nuevoEscrito.clienteId); }

  onTipoEscritoChange(): void {
    const plantilla = this.plantillas.find(p => p.tipo === this.nuevoEscrito.tipo);
    if (plantilla) { this.nuevoEscrito.contenido = plantilla.contenido; this.nuevoEscrito.plantillaId = plantilla.id; }
  }

  cargarPlantilla(): void {
    const plantilla = this.plantillas.find(p => p.id === this.nuevoEscrito.plantillaId);
    if (plantilla) this.nuevoEscrito.contenido = plantilla.contenido;
  }

  insertarVariable(variable: string): void {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.insertNode(document.createTextNode(variable));
    }
    if (this.editorContent) this.nuevoEscrito.contenido = this.editorContent.nativeElement.innerHTML;
  }

  formatText(command: string, event?: Event): void {
    if (event) { const select = event.target as HTMLSelectElement; document.execCommand(command, false, select.value); select.value = ''; }
    else document.execCommand(command, false);
  }

  onEditorInput(event: Event): void { this.nuevoEscrito.contenido = (event.target as HTMLElement).innerHTML; }
  limpiarEscrito(): void { if (confirm('¿Limpiar?')) this.nuevoEscrito = { clienteId: '', casoId: '', caratula: '', tipo: '', plantillaId: '', contenido: '' }; }

  previsualizarEscrito(): void {
    const cliente = this.clientes.find(c => c.id === this.nuevoEscrito.clienteId);
    let contenido = this.nuevoEscrito.contenido
      .replace(/\[Quien_Suscribe\]/g, this.usuario?.nombre || 'NOMBRE')
      .replace(/\[CARATULA\]/g, this.nuevoEscrito.caratula || 'CARATULA')
      .replace(/\[FECHA\]/g, new Date().toLocaleDateString('es-AR'))
      .replace(/\[CLIENTE\]/g, cliente?.nombre || 'CLIENTE');
    this.documentoPreview = `<div style="font-family:'Times New Roman';padding:20px;"><div style="text-align:right;"><strong>${this.nuevoEscrito.tipo.toUpperCase()}</strong></div>${contenido}<div style="margin-top:40px;text-align:right;"><p>___________________________</p><p><strong>${this.usuario?.nombre}</strong></p></div></div>`;
    this.mostrarModalPreview = true;
  }

  guardarBorrador(): void { this.notificacionesService.mostrarNotificacion('💾 Borrador guardado', 'success'); }

  guardarEscrito(): void {
    if (!this.nuevoEscrito.clienteId || !this.nuevoEscrito.tipo) { this.notificacionesService.mostrarNotificacion('❌ Completa cliente y tipo', 'error'); return; }
    const cliente = this.clientes.find(c => c.id === this.nuevoEscrito.clienteId);
    this.documentos.unshift({
      id: this.documentos.length + 1, nombre: `Escrito ${this.nuevoEscrito.tipo.toUpperCase()} - ${cliente?.nombre}`,
      tipo: 'escrito', extension: 'DOC', tamanio: '45 KB', fecha: new Date().toLocaleDateString('es-AR'),
      clienteId: this.nuevoEscrito.clienteId, clienteNombre: cliente?.nombre || '',
      caso: this.nuevoEscrito.casoId || undefined, contenido: this.nuevoEscrito.contenido, creadoPor: this.usuario?.nombre
    });
    this.estadisticas.totalDocumentos++;
    this.estadisticas.escritosCreados++;
    this.notificacionesService.mostrarNotificacion(`✅ Escrito guardado para ${cliente?.nombre}`, 'success');
    this.nuevoEscrito = { clienteId: '', casoId: '', caratula: '', tipo: '', plantillaId: '', contenido: '' };
    this.filtrarDocumentos();
    this.cambiarTab('todos');
  }

  editarPlantilla(plantilla: Plantilla): void { this.plantillaSeleccionada = plantilla; }
  duplicarPlantilla(plantilla: Plantilla): void {
    this.plantillas.push({ ...plantilla, id: 'p-' + Date.now(), nombre: plantilla.nombre + ' (Copia)', vecesUsada: 0 });
    this.estadisticas.plantillasActivas++;
    this.notificacionesService.mostrarNotificacion('📋 Plantilla duplicada', 'success');
  }

  eliminarPlantilla(plantilla: Plantilla): void {
    if (confirm(`¿Eliminar "${plantilla.nombre}"?`)) {
      this.plantillas = this.plantillas.filter(p => p.id !== plantilla.id);
      this.estadisticas.plantillasActivas--;
      this.notificacionesService.mostrarNotificacion('🗑️ Plantilla eliminada', 'success');
    }
  }

  usarPlantilla(plantilla: Plantilla): void {
    this.nuevoEscrito.tipo = plantilla.tipo;
    this.nuevoEscrito.plantillaId = plantilla.id;
    this.nuevoEscrito.contenido = plantilla.contenido;
    this.cambiarTab('nuevoEscrito');
  }

  nuevaPlantilla(): void { alert('Funcionalidad para crear nueva plantilla'); }
  getPlantillasMasUsadas(): Plantilla[] { return [...this.plantillas].sort((a, b) => (b.vecesUsada || 0) - (a.vecesUsada || 0)).slice(0, 5); }

  cerrarModalPreview(): void { this.mostrarModalPreview = false; this.documentoPreview = ''; }
  imprimirDocumento(): void {
    const w = window.open('', '_blank');
    if (w) { w.document.write(`<html><head><title>Imprimir</title></head><body>${this.documentoPreview}</body></html>`); w.document.close(); w.print(); }
  }
  descargarPDF(): void { this.notificacionesService.mostrarNotificacion('⬇️ Generando PDF...', 'info'); }
}
