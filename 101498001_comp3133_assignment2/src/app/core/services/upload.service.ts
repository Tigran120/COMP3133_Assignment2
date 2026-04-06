import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  uploadProfilePhoto(file: File): Observable<{ success: boolean; message: string; url: string | null }> {
    const form = new FormData();
    form.append('photo', file);
    const token = this.auth.getToken();
    return this.http.post<{ success: boolean; message: string; url: string | null }>(
      `${environment.apiUrl}/api/upload`,
      form,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  }
}
