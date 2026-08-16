import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { App } from './app';
import { FlashcardService, Flashcard } from './services/flashcard.service';

describe('App', () => {
  let mockFlashcardService: Partial<FlashcardService>;
  const mockCards: Flashcard[] = [
    { id: '1', frontText: 'What is Angular?', backText: 'A web framework' },
    { id: '2', frontText: 'What is TypeScript?', backText: 'Typed JavaScript' }
  ];

  beforeEach(async () => {
    mockFlashcardService = {
      getAll: () => of(mockCards),
      create: (card: Flashcard) => of({ id: '3', ...card }),
      delete: (id: string) => of(void 0),
      getById: (id: string) => of(mockCards[0]),
      update: (id: string, card: Flashcard) => of(card)
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FlashcardService, useValue: mockFlashcardService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render application title Smart Cards', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Smart Cards');
  });

  it('should load flashcards on initialization', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    expect((app as any).cards().length).toBe(2);
  });

  it('should toggle card flip state when toggleCardFlip is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    expect(app.isCardFlipped('1')).toBe(false);
    app.toggleCardFlip('1');
    expect(app.isCardFlipped('1')).toBe(true);
    app.toggleCardFlip('1');
    expect(app.isCardFlipped('1')).toBe(false);
  });

  it('should flip all cards and reset all cards', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    expect(app.areAllCardsFlipped()).toBe(false);
    app.flipAllCards();
    expect(app.areAllCardsFlipped()).toBe(true);
    expect(app.isCardFlipped('1')).toBe(true);
    expect(app.isCardFlipped('2')).toBe(true);

    app.flipAllCards();
    expect(app.areAllCardsFlipped()).toBe(false);
    expect(app.isCardFlipped('1')).toBe(false);
  });

  it('should filter cards matching search query', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    expect(app.filteredCards().length).toBe(2);
    app.searchQuery.set('Angular');
    expect(app.filteredCards().length).toBe(1);
    expect(app.filteredCards()[0].frontText).toBe('What is Angular?');

    app.searchQuery.set('Nonexistent query');
    expect(app.filteredCards().length).toBe(0);
  });

  it('should toggle dark mode', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;
    const initialMode = app.isDarkMode();
    app.toggleDarkMode();
    expect(app.isDarkMode()).toBe(!initialMode);
  });

  it('should toggle language between EN and ES and translate card texts', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    expect(app.currentLanguage()).toBe('en');
    expect(app.getTranslatedText('What is Angular?')).toBe('What is Angular?');

    app.toggleLanguage();
    expect(app.currentLanguage()).toBe('es');
    expect(app.getTranslatedText('What is Angular?')).toBe('¿Qué es Angular?');
    expect(app.getTranslatedText('A web framework')).toBe('Un framework web');

    app.toggleLanguage();
    expect(app.currentLanguage()).toBe('en');
    expect(app.getTranslatedText('What is Angular?')).toBe('What is Angular?');
  });
});

