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

  // Validaciones básicas del front
  if (!this.registerData.acceptTerms) {
    alert('Debes aceptar los términos y condiciones');
    return;
  }

  if (this.registerData.password !== this.registerData.passwordConfirm) {
    alert('Las contraseñas no coinciden');
    return;
  }

  if (!this.registerData.tipoUsuario) {
    alert('Por favor selecciona el tipo de usuario');
    return;
  }

  // Objeto que espera el AuthService.register
  const payload = {
    nombre: this.registerData.nombre,
    email: this.registerData.email,
    telefono: this.registerData.telefono,
    tipoUsuario: this.registerData.tipoUsuario, // 'cliente' | 'asesor'
    password: this.registerData.password
  };

  // Llamada al AuthService (que internamente hace mock + backend en paralelo)
  this.authService.register(payload).subscribe({
    next: (res) => {
      console.log('Usuario registrado:', res);

      alert(
        '✅ Cuenta creada con éxito\n\n' +
        'Ya podés iniciar sesión con tu correo y contraseña.'
      );

      // Opcional: limpiar formulario
      this.registerData = {
        nombre: '',
        email: '',
        telefono: '',
        tipoUsuario: '',
        password: '',
        passwordConfirm: '',
        acceptTerms: false
      };

      // Volver a la vista de login
      this.mostrarLogin();
    },
    error: (err) => {
      console.error('Error en registro:', err);
      alert(err.message || 'Ocurrió un error al registrar el usuario');
    }
  });
}


  handleRecuperar(event: Event) {
  event.preventDefault();

  const email = this.recuperarData.email;

  if (!email) {
    alert('Por favor ingresa tu correo electrónico');
    return;
  }

  this.authService.recuperarPassword(email).subscribe({
    next: (res) => {
      console.log('Recuperar password:', res);

      alert(
        '✅ Enlace enviado\n\n' +
        'Si el correo existe en el sistema, te enviamos un email a:\n' + email
      );

      // Volver al login
      this.mostrarLogin();
    },
    error: (err) => {
      console.error('Error al recuperar contraseña:', err);
      alert(err.message || 'No se pudo procesar la recuperación de contraseña');
    }
  });
}


  volverInicio() {
    this.router.navigate(['/inicio']);
  }
}