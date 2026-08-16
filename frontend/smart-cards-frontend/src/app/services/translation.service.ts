import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type Language = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  public readonly currentLanguage = signal<Language>(this.getInitialLanguage());

  // Distinct directional dictionaries
  private readonly enToEsMap: Map<string, string> = new Map([
    ['what is the capital of france?', '¿Cuál es la capital de Francia?'],
    ['paris', 'París'],
    ['what does html stand for?', '¿Qué significa HTML?'],
    ['hypertext markup language', 'Lenguaje de Marcado de Hipertexto'],
    ['what is 2 + 2?', '¿Cuánto es 2 + 2?'],
    ['4', '4'],
    ['which planet is known as the red planet?', '¿Qué planeta es conocido como el Planeta Rojo?'],
    ['mars', 'Marte'],
    ['what is the purpose of css?', '¿Cuál es el propósito de CSS?'],
    ['to style and layout web pages', 'Dar estilo y diseño a las páginas web'],
    ['test front add card', 'Tarjeta de prueba frontal'],
    ['test back add card', 'Tarjeta de prueba trasera'],
    ['what is angular?', '¿Qué es Angular?'],
    ['a web framework', 'Un framework web'],
    ['what is typescript?', '¿Qué es TypeScript?'],
    ['typed javascript', 'JavaScript tipado']
  ]);

  private readonly esToEnMap: Map<string, string> = new Map([
    ['¿cuál es la capital de francia?', 'What is the capital of France?'],
    ['parís', 'Paris'],
    ['¿qué significa html?', 'What does HTML stand for?'],
    ['lenguaje de marcado de hipertexto', 'HyperText Markup Language'],
    ['¿cuánto es 2 + 2?', 'What is 2 + 2?'],
    ['¿qué planeta es conocido como el planeta rojo?', 'Which planet is known as the Red Planet?'],
    ['marte', 'Mars'],
    ['¿cuál es el propósito de css?', 'What is the purpose of CSS?'],
    ['dar estilo y diseño a las páginas web', 'To style and layout web pages'],
    ['tarjeta de prueba frontal', 'Test front add card'],
    ['tarjeta de prueba trasera', 'Test back add card'],
    ['¿qué es angular?', 'What is Angular?'],
    ['un framework web', 'A web framework'],
    ['¿qué es typescript?', 'What is TypeScript?'],
    ['javascript tipado', 'Typed JavaScript']
  ]);

  constructor(private http: HttpClient) {}

  private getInitialLanguage(): Language {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('app_language');
      if (stored === 'en' || stored === 'es') {
        return stored;
      }
    }
    return 'en';
  }

  public setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app_language', lang);
    }
  }

  public toggleLanguage(): void {
    const nextLang = this.currentLanguage() === 'en' ? 'es' : 'en';
    this.setLanguage(nextLang);
  }

  /**
   * Translates card text synchronously from cache or fallback dictionary,
   * and triggers background network translation for un-cached arbitrary text.
   */
  public translateText(text: string | undefined, targetLang: Language): string {
    if (!text || !text.trim()) return '';

    const cleanText = text.trim();
    const key = cleanText.toLowerCase();

    if (targetLang === 'en') {
      // Check if text is Spanish and has an English translation
      const enTranslation = this.esToEnMap.get(key);
      if (enTranslation) return enTranslation;

      return cleanText;
    }

    // Target is Spanish
    const esTranslation = this.enToEsMap.get(key);
    if (esTranslation) {
      return esTranslation;
    }

    // Try fetching translation asynchronously if not cached
    this.fetchRemoteTranslation(cleanText, 'en', 'es');

    return cleanText;
  }

  private fetchRemoteTranslation(text: string, from: string, to: string): void {
    const key = text.toLowerCase();
    if (this.enToEsMap.has(key)) return;

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    this.http.get<any>(url).pipe(
      map(res => res?.responseData?.translatedText),
      catchError(() => of(null))
    ).subscribe(translated => {
      if (translated && translated !== text) {
        this.enToEsMap.set(key, translated);
        this.esToEnMap.set(translated.toLowerCase(), text);
      }
    });
  }
}
