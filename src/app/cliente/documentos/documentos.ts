import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  caso?: string;
  descripcion?: string;
  contenido?: string;
  url?: string;
}

interface Plantilla {
  id: string;
  nombre: string;
  tipo: string;
  icono: string;
  descripcion: string;
  contenido: string;
}

interface Caso {
  id: string;
  numero: string;
  titulo: string;
}

interface NuevoEscrito {
  tipo: string;
  plantilla: string;
  caso: string;
  caratula: string;
  contenido: string;
}

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './documentos.html',
  styleUrls: ['./documentos.css']
})
export class Documentos implements OnInit {

  @ViewChild('editorContent') editorContent!: ElementRef;

  usuario: Usuario | null = null;

  // Control de tabs
  tabActivo: 'documentos' | 'subir' | 'nuevo' | 'plantillas' = 'documentos';

  // Estadísticas
  estadisticas = {
    totalDocumentos: 12,
    plantillasUsadas: 5,
    documentosSubidos: 7
  };

  // Filtros
  filtros = {
    busqueda: '',
    tipo: 'todos',
    caso: 'todos'
  };

  // Documentos
  documentos: Documento[] = [
    {
      id: 1,
      nombre: 'DNI Frente y Dorso',
      tipo: 'img',
      extension: 'JPG',
      tamanio: '2.5 MB',
      fecha: '20/11/2024',
      caso: '2024-001',
      descripcion: 'Documento de identidad'
    },
    {
      id: 2,
      nombre: 'Contrato de Trabajo',
      tipo: 'pdf',
      extension: 'PDF',
      tamanio: '1.2 MB',
      fecha: '18/11/2024',
      caso: '2024-001',
      descripcion: 'Contrato laboral original'
    },
    {
      id: 3,
      nombre: 'Escrito de Demanda',
      tipo: 'doc',
      extension: 'DOCX',
      tamanio: '350 KB',
      fecha: '15/11/2024',
      caso: '2024-001'
    },
    {
      id: 4,
      nombre: 'Telegrama de Despido',
      tipo: 'pdf',
      extension: 'PDF',
      tamanio: '180 KB',
      fecha: '10/11/2024',
      caso: '2024-001'
    },
    {
      id: 5,
      nombre: 'Recibos de Sueldo',
      tipo: 'pdf',
      extension: 'PDF',
      tamanio: '3.8 MB',
      fecha: '08/11/2024',
      caso: '2024-001',
      descripcion: 'Últimos 6 meses'
    },
    {
      id: 6,
      nombre: 'Escrito AGREGA - Documentación',
      tipo: 'escrito',
      extension: 'DOC',
      tamanio: '45 KB',
      fecha: '05/11/2024',
      caso: '2024-002'
    }
  ];

  documentosFiltrados: Documento[] = [];

  // Casos disponibles
  casosDisponibles: Caso[] = [
    { id: '2024-001', numero: '2024-001', titulo: 'Despido Injustificado' },
    { id: '2024-002', numero: '2024-002', titulo: 'Divorcio Mutuo Acuerdo' },
    { id: '2024-003', numero: '2024-003', titulo: 'Contrato Alquiler' }
  ];

  // Upload
  isDragging = false;
  archivosSeleccionados: File[] = [];
  casoSeleccionado = '';
  descripcionArchivo = '';

  // Nuevo Escrito
  nuevoEscrito: NuevoEscrito = {
    tipo: '',
    plantilla: 'generica',
    caso: '',
    caratula: '',
    contenido: ''
  };

  tiposEscrito = [
    { value: 'agrega', label: 'AGREGA' },
    { value: 'contesta', label: 'CONTESTA DEMANDA' },
    { value: 'solicita', label: 'SOLICITA' },
    { value: 'acredita', label: 'ACREDITA' },
    { value: 'apela', label: 'APELA' },
    { value: 'interpone', label: 'INTERPONE RECURSO' },
    { value: 'ofrece', label: 'OFRECE PRUEBA' },
    { value: 'desiste', label: 'DESISTE' },
    { value: 'alega', label: 'ALEGA' },
    { value: 'denuncia', label: 'DENUNCIA HECHO NUEVO' }
  ];

  variablesDisponibles = [
    '[Quien_Suscribe]',
    '[CARATULA]',
    '[FECHA]',
    '[EXPEDIENTE]',
    '[JUZGADO]',
    '[SECRETARIA]',
    '[DEMANDANTE]',
    '[DEMANDADO]',
    '[DOMICILIO]',
    '[DNI]'
  ];

  plantillasDisponibles = [
    { id: 'generica', nombre: 'Plantilla Genérica' },
    { id: 'agrega-simple', nombre: 'Agrega Documentación Simple' },
    { id: 'agrega-completo', nombre: 'Agrega con Fundamentación' }
  ];

  // Plantillas predeterminadas
  plantillas: Plantilla[] = [
    {
      id: 'agrega',
      nombre: 'AGREGA',
      tipo: 'agrega',
      icono: '📎',
      descripcion: 'Para agregar documentación al expediente',
      contenido: `<p><strong>Señor/a Juez:</strong></p>
<p>[Quien_Suscribe], en estos autos caratulados "[CARATULA]", comparezco y DIGO:</p>
<p>Que acompaño a estos obrados la siguiente documentación:</p>
<ul>
<li>_______________</li>
<li>_______________</li>
</ul>
<p>Por lo expuesto solicito:</p>
<p>Agréguese lo acompañado.</p>
<p><strong>Es justicia.</strong></p>`
    },
    {
      id: 'solicita',
      nombre: 'SOLICITA',
      tipo: 'solicita',
      icono: '📝',
      descripcion: 'Para realizar solicitudes al juzgado',
      contenido: `<p><strong>Señor/a Juez:</strong></p>
<p>[Quien_Suscribe], en los autos caratulados "[CARATULA]", a V.S. respetuosamente digo:</p>
<p>Que vengo por el presente a solicitar a V.S.:</p>
<p>_______________________________________________</p>
<p>_______________________________________________</p>
<p>Fundo la presente solicitud en las siguientes razones de hecho y derecho:</p>
<p>_______________________________________________</p>
<p><strong>PETITORIO:</strong></p>
<p>Por lo expuesto, solicito a V.S.:</p>
<p>1. Tenga por presentado el presente escrito.</p>
<p>2. Haga lugar a lo peticionado.</p>
<p><strong>Provea V.S. de conformidad que será justicia.</strong></p>`
    },
    {
      id: 'acredita',
      nombre: 'ACREDITA PERSONERÍA',
      tipo: 'acredita',
      icono: '🪪',
      descripcion: 'Para acreditar representación legal',
      contenido: `<p><strong>Señor/a Juez:</strong></p>
<p>[Quien_Suscribe], abogado/a, inscripto/a en la matrícula bajo el Tº ___ Fº ___ del Colegio de Abogados de ___________, constituyendo domicilio procesal en _____________, domicilio electrónico _____________, en los autos caratulados "[CARATULA]", a V.S. respetuosamente digo:</p>
<p>Que vengo a acreditar personería suficiente para actuar en el presente proceso, en virtud del poder especial que en original acompaño.</p>
<p><strong>PETITORIO:</strong></p>
<p>Por lo expuesto, solicito:</p>
<p>1. Me tenga por presentado, parte y por constituido el domicilio procesal indicado.</p>
<p>2. Se tenga por acreditada la personería invocada.</p>
<p><strong>Provea V.S. de conformidad que será justicia.</strong></p>`
    },
    {
      id: 'apela',
      nombre: 'APELA',
      tipo: 'apela',
      icono: '⚖️',
      descripcion: 'Para interponer recurso de apelación',
      contenido: `<p><strong>Señor/a Juez:</strong></p>
<p>[Quien_Suscribe], en los autos caratulados "[CARATULA]", a V.S. respetuosamente digo:</p>
<p>Que vengo en tiempo y forma a interponer RECURSO DE APELACIÓN contra la resolución de fecha _________, notificada el día _________, por causar gravamen irreparable a los intereses de mi parte.</p>
<p><strong>FUNDAMENTOS:</strong></p>
<p>Los agravios que fundamentan el presente recurso serán expresados ante la Alzada en la oportunidad procesal correspondiente.</p>
<p><strong>PETITORIO:</strong></p>
<p>Por lo expuesto, solicito:</p>
<p>1. Tenga por interpuesto el recurso de apelación.</p>
<p>2. Se conceda el mismo y se eleven las actuaciones al Superior.</p>
<p><strong>Provea V.S. de conformidad que será justicia.</strong></p>`
    },
    {
      id: 'ofrece-prueba',
      nombre: 'OFRECE PRUEBA',
      tipo: 'solicita',
      icono: '📋',
      descripcion: 'Para ofrecer medios probatorios',
      contenido: `<p><strong>Señor/a Juez:</strong></p>
<p>[Quien_Suscribe], en los autos caratulados "[CARATULA]", a V.S. respetuosamente digo:</p>
<p>Que vengo en tiempo y forma a ofrecer la siguiente prueba:</p>
<p><strong>I. DOCUMENTAL:</strong></p>
<p>Se tenga por ofrecida la documentación acompañada con el escrito de demanda/contestación.</p>
<p><strong>II. INFORMATIVA:</strong></p>
<p>Se libre oficio a:</p>
<p>a) _______________</p>
<p>b) _______________</p>
<p><strong>III. TESTIMONIAL:</strong></p>
<p>Se cite a declarar a los siguientes testigos:</p>
<p>a) _______________</p>
<p><strong>IV. CONFESIONAL:</strong></p>
<p>Se cite a absolver posiciones a la contraria.</p>
<p><strong>PETITORIO:</strong></p>
<p>Solicito se tenga por ofrecida la prueba y se provea de conformidad.</p>
<p><strong>Será justicia.</strong></p>`
    },
    {
      id: 'contesta',
      nombre: 'CONTESTA TRASLADO',
      tipo: 'contesta',
      icono: '↩️',
      descripcion: 'Para contestar traslados o vistas',
      contenido: `<p><strong>Señor/a Juez:</strong></p>
<p>[Quien_Suscribe], en los autos caratulados "[CARATULA]", evacuando el traslado conferido, a V.S. respetuosamente digo:</p>
<p>Que vengo en tiempo y forma a contestar el traslado conferido, manifestando lo siguiente:</p>
<p>_______________________________________________</p>
<p>_______________________________________________</p>
<p><strong>PETITORIO:</strong></p>
<p>Por lo expuesto, solicito:</p>
<p>1. Se tenga por contestado el traslado en tiempo y forma.</p>
<p>2. Se continúe con el trámite de la causa según su estado.</p>
<p><strong>Provea V.S. de conformidad que será justicia.</strong></p>`
    }
  ];

  plantillaSeleccionada: Plantilla | null = null;

  // Modal
  mostrarModalPreview = false;
  documentoPreview = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
    
    if (!this.usuario || !this.authService.esCliente()) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.documentosFiltrados = [...this.documentos];
    this.cargarPlantillaInicial();
  }

  // ========== TABS ==========
  cambiarTab(tab: 'documentos' | 'subir' | 'nuevo' | 'plantillas'): void {
    this.tabActivo = tab;
    window.scrollTo(0, 0);
  }

  // ========== FILTROS ==========
  filtrarDocumentos(): void {
    this.documentosFiltrados = this.documentos.filter(doc => {
      const matchBusqueda = this.filtros.busqueda === '' || 
        doc.nombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase());
      
      const matchTipo = this.filtros.tipo === 'todos' || doc.tipo === this.filtros.tipo;
      
      const matchCaso = this.filtros.caso === 'todos' || doc.caso === this.filtros.caso;
      
      return matchBusqueda && matchTipo && matchCaso;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      tipo: 'todos',
      caso: 'todos'
    };
    this.filtrarDocumentos();
  }

  // ========== DOCUMENTOS ==========
  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'pdf': '📕',
      'doc': '📘',
      'img': '🖼️',
      'escrito': '📝'
    };
    return iconos[tipo] || '📄';
  }

  previsualizarDocumento(doc: Documento): void {
    if (doc.contenido) {
      this.documentoPreview = doc.contenido;
    } else {
      this.documentoPreview = `
        <div style="text-align: center; padding: 50px;">
          <div style="font-size: 64px; margin-bottom: 20px;">${this.getIconoTipo(doc.tipo)}</div>
          <h4>${doc.nombre}</h4>
          <p>Tipo: ${doc.extension} | Tamaño: ${doc.tamanio}</p>
          <p>Fecha: ${doc.fecha}</p>
          ${doc.caso ? `<p>Caso: #${doc.caso}</p>` : ''}
          ${doc.descripcion ? `<p>Descripción: ${doc.descripcion}</p>` : ''}
        </div>
      `;
    }
    this.mostrarModalPreview = true;
  }

  descargarDocumento(doc: Documento): void {
    this.notificacionesService.mostrarNotificacion(
      `⬇️ Descargando ${doc.nombre}...`,
      'info'
    );
    // Aquí iría la lógica real de descarga
  }

  eliminarDocumento(doc: Documento): void {
    if (confirm(`¿Estás seguro de eliminar "${doc.nombre}"?`)) {
      this.documentos = this.documentos.filter(d => d.id !== doc.id);
      this.filtrarDocumentos();
      this.estadisticas.totalDocumentos--;
      this.estadisticas.documentosSubidos--;
      
      this.notificacionesService.mostrarNotificacion(
        `🗑️ Documento "${doc.nombre}" eliminado`,
        'success'
      );
    }
  }

  // ========== UPLOAD ==========
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.procesarArchivos(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.procesarArchivos(input.files);
    }
  }

  procesarArchivos(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.notificacionesService.mostrarNotificacion(
          `❌ ${file.name} excede el tamaño máximo de 10MB`,
          'error'
        );
        continue;
      }

      // Validar tipo
      const tiposPermitidos = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png'];
      
      if (!tiposPermitidos.includes(file.type)) {
        this.notificacionesService.mostrarNotificacion(
          `❌ ${file.name} no es un tipo de archivo permitido`,
          'error'
        );
        continue;
      }

      this.archivosSeleccionados.push(file);
    }
  }

  removerArchivo(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }

  getTipoArchivo(nombre: string): string {
    const extension = nombre.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'doc';
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) return 'img';
    return 'doc';
  }

  formatearTamanio(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  subirArchivos(): void {
    if (this.archivosSeleccionados.length === 0) {
      this.notificacionesService.mostrarNotificacion(
        '❌ No hay archivos seleccionados',
        'error'
      );
      return;
    }

    // Simular subida
    this.archivosSeleccionados.forEach((archivo, index) => {
      const nuevoDoc: Documento = {
        id: this.documentos.length + index + 1,
        nombre: archivo.name.replace(/\.[^/.]+$/, ''),
        tipo: this.getTipoArchivo(archivo.name) as any,
        extension: archivo.name.split('.').pop()?.toUpperCase() || '',
        tamanio: this.formatearTamanio(archivo.size),
        fecha: new Date().toLocaleDateString('es-AR'),
        caso: this.casoSeleccionado || undefined,
        descripcion: this.descripcionArchivo || undefined
      };
      this.documentos.unshift(nuevoDoc);
    });

    this.estadisticas.totalDocumentos += this.archivosSeleccionados.length;
    this.estadisticas.documentosSubidos += this.archivosSeleccionados.length;

    this.notificacionesService.mostrarNotificacion(
      `✅ ${this.archivosSeleccionados.length} archivo(s) subido(s) exitosamente`,
      'success'
    );

    // Limpiar
    this.archivosSeleccionados = [];
    this.casoSeleccionado = '';
    this.descripcionArchivo = '';
    this.filtrarDocumentos();
    this.cambiarTab('documentos');
  }

  // ========== EDITOR DE ESCRITOS ==========
  cargarPlantillaInicial(): void {
    const plantillaGenerica = this.plantillas.find(p => p.id === 'agrega');
    if (plantillaGenerica) {
      this.nuevoEscrito.contenido = plantillaGenerica.contenido;
    }
  }

  onTipoEscritoChange(): void {
    const plantilla = this.plantillas.find(p => p.tipo === this.nuevoEscrito.tipo);
    if (plantilla) {
      this.nuevoEscrito.contenido = plantilla.contenido;
    }
  }

  cargarPlantilla(): void {
    const plantilla = this.plantillas.find(p => p.id === this.nuevoEscrito.plantilla);
    if (plantilla) {
      this.nuevoEscrito.contenido = plantilla.contenido;
    }
  }

  insertarVariable(variable: string): void {
    // Insertar variable en la posición del cursor del editor
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(variable);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Actualizar el contenido
    if (this.editorContent) {
      this.nuevoEscrito.contenido = this.editorContent.nativeElement.innerHTML;
    }
  }

  formatText(command: string, event?: Event): void {
    if (event) {
      const select = event.target as HTMLSelectElement;
      document.execCommand(command, false, select.value);
      select.value = '';
    } else {
      document.execCommand(command, false);
    }
  }

  onEditorInput(event: Event): void {
    const target = event.target as HTMLElement;
    this.nuevoEscrito.contenido = target.innerHTML;
  }

  limpiarEditor(): void {
    if (confirm('¿Estás seguro de limpiar todo el contenido?')) {
      this.nuevoEscrito.contenido = '';
      if (this.editorContent) {
        this.editorContent.nativeElement.innerHTML = '';
      }
    }
  }

  limpiarEscrito(): void {
    if (confirm('¿Estás seguro de limpiar todo el escrito?')) {
      this.nuevoEscrito = {
        tipo: '',
        plantilla: 'generica',
        caso: '',
        caratula: '',
        contenido: ''
      };
      this.cargarPlantillaInicial();
    }
  }

  previsualizarEscrito(): void {
    let contenido = this.nuevoEscrito.contenido;
    
    // Reemplazar variables con valores de ejemplo
    contenido = contenido.replace(/\[Quien_Suscribe\]/g, this.usuario?.nombre || 'NOMBRE APELLIDO');
    contenido = contenido.replace(/\[CARATULA\]/g, this.nuevoEscrito.caratula || 'CARATULA DEL EXPEDIENTE');
    contenido = contenido.replace(/\[FECHA\]/g, new Date().toLocaleDateString('es-AR'));
    
    this.documentoPreview = `
      <div style="font-family: 'Times New Roman', serif; padding: 20px;">
        <div style="text-align: right; margin-bottom: 20px;">
          <strong>${this.nuevoEscrito.tipo.toUpperCase() || 'ESCRITO'}</strong>
        </div>
        ${contenido}
        <div style="margin-top: 40px; text-align: right;">
          <p>___________________________</p>
          <p><strong>${this.usuario?.nombre || 'FIRMA'}</strong></p>
        </div>
      </div>
    `;
    this.mostrarModalPreview = true;
  }

  guardarBorrador(): void {
    this.notificacionesService.mostrarNotificacion(
      '💾 Borrador guardado correctamente',
      'success'
    );
    // Aquí iría la lógica para guardar en localStorage o backend
  }

  guardarEscrito(): void {
    if (!this.nuevoEscrito.tipo) {
      this.notificacionesService.mostrarNotificacion(
        '❌ Selecciona un tipo de escrito',
        'error'
      );
      return;
    }

    const nuevoDoc: Documento = {
      id: this.documentos.length + 1,
      nombre: `Escrito ${this.nuevoEscrito.tipo.toUpperCase()} - ${this.nuevoEscrito.caratula || 'Sin carátula'}`,
      tipo: 'escrito',
      extension: 'DOC',
      tamanio: '45 KB',
      fecha: new Date().toLocaleDateString('es-AR'),
      caso: this.nuevoEscrito.caso || undefined,
      contenido: this.nuevoEscrito.contenido
    };

    this.documentos.unshift(nuevoDoc);
    this.estadisticas.totalDocumentos++;
    this.estadisticas.plantillasUsadas++;

    this.notificacionesService.mostrarNotificacion(
      '✅ Escrito guardado correctamente',
      'success'
    );

    // Limpiar y volver a documentos
    this.limpiarEscrito();
    this.filtrarDocumentos();
    this.cambiarTab('documentos');
  }

  // ========== PLANTILLAS ==========
  seleccionarPlantilla(plantilla: Plantilla): void {
    this.plantillaSeleccionada = plantilla;
  }

  usarPlantilla(plantilla: Plantilla): void {
    this.nuevoEscrito.tipo = plantilla.tipo;
    this.nuevoEscrito.plantilla = plantilla.id;
    this.nuevoEscrito.contenido = plantilla.contenido;
    this.cambiarTab('nuevo');
    
    this.notificacionesService.mostrarNotificacion(
      `📋 Plantilla "${plantilla.nombre}" cargada`,
      'info'
    );
  }

  // ========== MODAL ==========
  cerrarModalPreview(): void {
    this.mostrarModalPreview = false;
    this.documentoPreview = '';
  }

  imprimirDocumento(): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir Documento</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; }
            </style>
          </head>
          <body>
            ${this.documentoPreview}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  descargarDocumentoPreview(): void {
    this.notificacionesService.mostrarNotificacion(
      '⬇️ Generando PDF...',
      'info'
    );
    // Aquí iría la lógica para generar y descargar PDF
  }
}
