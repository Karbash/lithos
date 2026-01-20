import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Furnace } from '../../shared/components/furnace-card/furnace-card.component';
import { environment } from '../../../environments/environment';

export interface FurnaceCreate {
  nome: string;
  planta: string;
  tipo: string;
  capacidade: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  temperaturaAtual: number;
  tenantId: string;
}

@Injectable({
  providedIn: 'root',
})
export class FornosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Furnace[]> {
    return this.http.get<Furnace[]>(`${this.apiUrl}/fornos`);
  }

  getById(id: string): Observable<Furnace> {
    return this.http.get<Furnace>(`${this.apiUrl}/fornos/${id}`);
  }

  create(forno: FurnaceCreate): Observable<Furnace> {
    return this.http.post<Furnace>(`${this.apiUrl}/fornos`, forno);
  }

  update(id: string, forno: Partial<Furnace>): Observable<Furnace> {
    return this.http.patch<Furnace>(`${this.apiUrl}/fornos/${id}`, forno);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fornos/${id}`);
  }
}
