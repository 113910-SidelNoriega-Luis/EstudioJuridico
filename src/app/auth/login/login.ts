import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  
  // Control de vistas
  vistaActual: 'login' | 'registro' | 'recuperar' = 'login';

  // Modelo de login
  loginData = {
    email: '',
    password: '',
    remember: false
  };

  // Modelo de registro
  registerData = {
    nombre: '',
    email: '',
    telefono: '',
    tipoUsuario: '',
    password: '',
    passwordConfirm: '',
    acceptTerms: false
  };

  // Modelo de recuperar
  recuperarData = {
    email: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  mostrarLogin() {
    this.vistaActual = 'login';
    this.actualizarHero('Bienvenido de vuelta', 'Inicia sesión en tu cuenta');
  }

  mostrarRegistro() {
    this.vistaActual = 'registro';
    this.actualizarHero('Únete a nosotros', 'Crea tu cuenta y accede a todos nuestros servicios');
  }

  mostrarRecuperar() {
    this.vistaActual = 'recuperar';
    this.actualizarHero('Recuperar Acceso', 'No te preocupes, te ayudaremos a recuperar tu cuenta');
  }

  actualizarHero(titulo: string, subtitulo: string) {
    // Esto se puede mejorar con @ViewChild si quieres actualizar el DOM
    setTimeout(() => {
      const heroTitle = document.getElementById('heroTitle');
      const heroSubtitle = document.getElementById('heroSubtitle');
      if (heroTitle) heroTitle.textContent = titulo;
      if (heroSubtitle) heroSubtitle.textContent = subtitulo;
    }, 0);
  }

  togglePassword(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      const icon = input.nextElementSibling as HTMLElement;
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = '🙈';
      } else {
        input.type = 'password';
        if (icon) icon.textContent = '👁️';
      }
    }
  }

  handleLogin(event: Event) {
  event.preventDefault();

  this.authService.login(this.loginData.email, this.loginData.password)
    .subscribe({
      next: (usuario) => {
        // usuario viene SIN password, del servicio
        const tipoUsuario = usuario.tipoUsuario;

        alert('✅ ¡Inicio de sesión exitoso!\n\nTipo de usuario: ' + tipoUsuario.toUpperCase());

        if (tipoUsuario === 'asesor') {
          this.router.navigate(['/panel-asesor']);
        } else {
          this.router.navigate(['/panel-cliente']);
        }
      },
      error: (err) => {
        alert('❌ ' + (err.message || 'Credenciales incorrectas'));
      }
    });
}

  handleRegister(event: Event) {
    event.preventDefault();
    
    if (this.registerData.password !== this.registerData.passwordConfirm) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    if (!this.registerData.acceptTerms) {
      alert('❌ Debes aceptar los términos y condiciones');
      return;
    }

    console.log('Registro:', this.registerData);
    
    alert('✅ ¡Registro exitoso!\n\nBienvenido ' + this.registerData.nombre);
    
    // Cambiar a login y pre-llenar el email
    this.mostrarLogin();
    this.loginData.email = this.registerData.email;
  }

  handleRecuperar(event: Event) {
    event.preventDefault();
    
    console.log('Recuperar password:', this.recuperarData);
    
    alert('✅ Enlace enviado\n\nSe ha enviado un enlace de recuperación a:\n' + this.recuperarData.email);
    
    this.mostrarLogin();
  }

  volverInicio() {
    this.router.navigate(['/inicio']);
  }
}