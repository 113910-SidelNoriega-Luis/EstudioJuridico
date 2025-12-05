import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

interface Turno {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  estado: 'confirmado' | 'pendiente';
}

interface Caso {
  id: number;
  numero: string;
  titulo: string;
  categoria: string;
  asesor: string;
  fechaInicio: string;
  estado: 'proceso' | 'completado' | 'pendiente';
}

interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
}


@Component({
  selector: 'app-home',
  imports: [CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  
  usuario: any;

  // Estadísticas
  stats = {
    turnosProximos: 3,
    consultasPendientes: 2,
    casosActivos: 5,
    documentos: 12
  };

  // Próximos turnos
  turnos: Turno[] = [
    {
      id: 1,
      titulo: 'Consulta Inicial - Derecho Laboral',
      fecha: '15/11/2024',
      hora: '19:00',
      estado: 'confirmado'
    },
    {
      id: 2,
      titulo: 'Seguimiento - Caso Civil',
      fecha: '18/11/2024',
      hora: '20:30',
      estado: 'confirmado'
    },
    {
      id: 3,
      titulo: 'Revisión de Documentos',
      fecha: '20/11/2024',
      hora: '19:30',
      estado: 'pendiente'
    }
  ];

  // Casos activos
  casos: Caso[] = [
    {
      id: 1,
      numero: '2024-001',
      titulo: 'Despido Injustificado',
      categoria: 'Laboral',
      asesor: 'Dra. María González',
      fechaInicio: '01/10/2024',
      estado: 'proceso'
    },
    {
      id: 2,
      numero: '2024-002',
      titulo: 'Divorcio de Mutuo Acuerdo',
      categoria: 'Familiar',
      asesor: 'Dr. Carlos Rodríguez',
      fechaInicio: '15/10/2024',
      estado: 'proceso'
    }
  ];

  // Actividad reciente
  actividades: Actividad[] = [
    {
      id: 1,
      titulo: 'Documento subido',
      descripcion: 'DNI - Frente y dorso',
      tiempo: 'Hace 2 horas'
    },
    {
      id: 2,
      titulo: 'Consulta respondida',
      descripcion: 'Dra. González respondió tu consulta',
      tiempo: 'Ayer'
    },
    {
      id: 3,
      titulo: 'Turno confirmado',
      descripcion: '15/11/2024 a las 19:00 hs',
      tiempo: 'Hace 2 días'
    },
    {
      id: 4,
      titulo: 'Caso actualizado',
      descripcion: 'Caso #2024-001 - Nuevo documento',
      tiempo: 'Hace 3 días'
    }
  ];

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

  getEstadoClass(estado: string): string {
    const clases: any = {
      'confirmado': 'status-confirmado',
      'pendiente': 'status-pendiente',
      'proceso': 'status-proceso',
      'completado': 'status-completado'
    };
    return clases[estado] || '';
  }  

}