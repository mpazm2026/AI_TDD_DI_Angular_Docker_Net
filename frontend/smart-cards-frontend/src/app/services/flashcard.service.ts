import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Flashcard {
  id?: string;
  frontText?: string;
  backText?: string;
  // Backend uses PascalCase property names
  FrontText?: string;
  BackText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = `${environment.apiBaseUrl}/api/flashcards`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(this.apiUrl);
  }

  getById(id: string): Observable<Flashcard> {
    return this.http.get<Flashcard>(`${this.apiUrl}/${id}`);
  }

  create(card: Flashcard): Observable<Flashcard> {
    return this.http.post<Flashcard>(this.apiUrl, card);
  }

  update(id: string, card: Flashcard): Observable<Flashcard> {
    return this.http.put<Flashcard>(`${this.apiUrl}/${id}`, card);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
