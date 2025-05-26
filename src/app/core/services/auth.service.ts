import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  public isLoggedIn = signal<boolean>(false);
  public isAdmin = signal<boolean>(false);
  
  constructor() {}
  
  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.router.navigate(['/auth/login']);
  }
  
  checkAuthStatus(): void {
    const token = this.getToken();
    
    if (!token) {
      this.userSubject.next(null);
      this.isLoggedIn.set(false);
      this.isAdmin.set(false);
      return;
    }
    
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const isExpired = decodedToken.exp * 1000 < Date.now();
      
      if (isExpired) {
        this.logout();
        return;
      }
      
      // Token is valid, get user data
      this.http.get<User>(`${environment.apiUrl}/users/me`).subscribe({
        next: (user) => {
          this.userSubject.next(user);
          this.isLoggedIn.set(true);
          this.isAdmin.set(user.role === 'admin');
        },
        error: () => this.logout()
      });
    } catch (error) {
      this.logout();
    }
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  private handleAuthentication(response: AuthResponse): void {
    const { token, user } = response;
    
    localStorage.setItem(this.tokenKey, token);
    this.userSubject.next(user);
    this.isLoggedIn.set(true);
    this.isAdmin.set(user.role === 'admin');
    
    this.router.navigate(['/dashboard']);
  }
}