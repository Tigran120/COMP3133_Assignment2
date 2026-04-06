import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map, tap } from 'rxjs';
import { AuthUser } from '../models/user.model';

const LOGIN = gql`
  query Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      success
      message
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(this.readStoredUser());
  private readonly authState = signal(0);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    this.authState();
    return !!this.getToken();
  });

  constructor(
    private readonly apollo: Apollo,
    private readonly router: Router
  ) {}

  private readStoredUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private persistSession(token: string, user: AuthUser): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
    this.authState.update((n) => n + 1);
  }

  login(usernameOrEmail: string, password: string): Observable<{ ok: boolean; message: string }> {
    return this.apollo
      .query<{ login: { success: boolean; message: string; token?: string; user?: AuthUser } }>({
        query: LOGIN,
        variables: { input: { usernameOrEmail, password } },
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      })
      .pipe(
        tap((r) => {
          const p = r.data?.login;
          if (p?.success && p.token && p.user) {
            this.persistSession(p.token, p.user);
          }
        }),
        map((r) => {
          const payload = r.data?.login;
          if (!payload) {
            return { ok: false, message: r.error?.message ?? 'No data from server' };
          }
          return { ok: !!payload.success, message: payload.message ?? 'Login failed' };
        })
      );
  }

  signup(username: string, email: string, password: string): Observable<{ ok: boolean; message: string }> {
    return this.apollo
      .mutate<{ signup: { success: boolean; message: string; token?: string; user?: AuthUser } }>({
        mutation: SIGNUP,
        variables: { input: { username, email, password } },
        errorPolicy: 'all',
      })
      .pipe(
        tap((r) => {
          const p = r.data?.signup;
          if (p?.success && p.token && p.user) {
            this.persistSession(p.token, p.user);
          }
        }),
        map((r) => {
          const payload = r.data?.signup;
          if (!payload) {
            return { ok: false, message: r.error?.message ?? 'No data from server' };
          }
          return { ok: !!payload.success, message: payload.message ?? 'Signup failed' };
        })
      );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.authState.update((n) => n + 1);
    void this.router.navigate(['/login']);
  }
}
