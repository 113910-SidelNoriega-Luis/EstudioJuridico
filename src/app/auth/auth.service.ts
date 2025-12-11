import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  tipoUsuario: 'cliente' | 'asesor';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080'; // o la URL de tu back

  private usuarioActual: Usuario | null = null;
  private isAuthenticated = false;

  private usuarios: any[] = [
    {
      id: 1,
      nombre: 'Admin Asesor',
      email: 'asesor@estudio.com',
      password: '12345678',
      telefono: '351-123-4567',
      tipoUsuario: 'asesor',
    },
    {
      id: 2,
      nombre: 'Juan Pérez',
      email: 'cliente@email.com',
      password: '12345678',
      telefono: '351-987-6543',
      tipoUsuario: 'cliente',
    },
  ];

  constructor(private http: HttpClient) {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
      this.isAuthenticated = true;
    }
  }

  login(email: string, password: string): Observable<any> {
    const usuario = this.usuarios.find((u) => u.email === email && u.password === password);

    if (usuario) {
      const { password, ...usuarioSinPassword } = usuario;
      this.usuarioActual = usuarioSinPassword;
      this.isAuthenticated = true;

      localStorage.setItem('usuario', JSON.stringify(usuarioSinPassword));
      localStorage.setItem('token', 'fake-jwt-token-' + Date.now());

      return of(usuarioSinPassword).pipe(delay(500));
    } else {
      return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(500));
    }
  }

  register(data: any): Observable<any> {
    const nuevoUsuario = {
      id: this.usuarios.length + 1,
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      telefono: data.telefono,
      tipoUsuario: data.tipoUsuario,
    };

    const emailExiste = this.usuarios.some((u) => u.email === data.email);
    if (emailExiste) {
      return throwError(() => new Error('El email ya está registrado')).pipe(delay(500));
    }

    // 👉 LÓGICA MOCK (seguís igual)
    this.usuarios.push(nuevoUsuario);
    const respuestaMock$ = of({ success: true, usuario: nuevoUsuario }).pipe(delay(500));

    // 👉 LLAMADA AL BACKEND EN PARALELO (fire & forget)
    const body = {
      nombreCompleto: data.nombre,
      email: data.email,
      telefono: data.telefono,
      tipoUsuario: data.tipoUsuario, // "CLIENTE" / "ASESOR"
      password: data.password,
      confirmarPassword: data.password, // si tu form no tiene confirmación, mandamos lo mismo
      aceptaTerminos: true, // o data.aceptaTerminos si lo tenés
    };

    this.http.post(`${this.apiUrl}/auth/register`, body).subscribe({
      next: (res) => console.log('Registro enviado al backend:', res),
      error: (err) => console.warn('Error registrando en backend (mock sigue ok):', err),
    });

    // 👉 lo que ve el front sigue siendo el mock
    return respuestaMock$;
  }

  recuperarPassword(email: string): Observable<any> {
    const usuario = this.usuarios.find((u) => u.email === email);

    if (usuario) {
      // 👉 MOCK (lo que ve el front)
      const respuestaMock$ = of({ success: true, message: 'Email enviado' }).pipe(delay(500));

      // 👉 LLAMADA AL BACKEND EN PARALELO
      const body = { email };

      this.http.post(`${this.apiUrl}/auth/forgot-password`, body).subscribe({
        next: (res) => console.log('Recuperación enviada al backend:', res),
        error: (err) =>
          console.warn('Error en backend al recuperar password (mock sigue ok):', err),
      });

      return respuestaMock$;
    } else {
      return throwError(() => new Error('Email no encontrado')).pipe(delay(500));
    }
  }

  logout(): void {
    this.usuarioActual = null;
    this.isAuthenticated = false;
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  esAsesor(): boolean {
    return this.usuarioActual?.tipoUsuario === 'asesor';
  }

  esCliente(): boolean {
    return this.usuarioActual?.tipoUsuario === 'cliente';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
