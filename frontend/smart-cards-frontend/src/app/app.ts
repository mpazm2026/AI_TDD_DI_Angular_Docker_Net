import { Component, signal, computed, effect, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { FlashcardService, Flashcard } from './services/flashcard.service';
import { TranslationService, Language } from './services/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Smart Cards');
  protected showAddCardModal = signal(false);
  protected showTechStack = signal(false);
  protected isSubmitting = signal(false);
  protected errorMessage = signal('');
  protected cards = signal<Flashcard[]>([]);
  protected searchQuery = signal('');
  protected isDarkMode = signal(this.getInitialDarkMode());
  protected selectedCardIds = signal<Set<string>>(new Set());
  protected flippedCardIds = signal<Set<string>>(new Set());

  protected readonly currentLanguage = computed<Language>(() => this.translationService.currentLanguage());

  protected formData = {
    frontText: '',
    backText: ''
  };

  protected filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allCards = this.cards();
    if (!query) return allCards;
    return allCards.filter(card => {
      const front = (card.FrontText || card.frontText || '').toLowerCase();
      const back = (card.BackText || card.backText || '').toLowerCase();
      const frontTranslated = this.getTranslatedText(card.FrontText || card.frontText).toLowerCase();
      const backTranslated = this.getTranslatedText(card.BackText || card.backText).toLowerCase();

      return front.includes(query) || back.includes(query) ||
             frontTranslated.includes(query) || backTranslated.includes(query);
    });
  });

  protected areAllCardsFlipped = computed(() => {
    const currentCards = this.filteredCards();
    if (currentCards.length === 0) return false;
    return currentCards.every(card => card.id && this.flippedCardIds().has(card.id));
  });

  constructor(
    private flashcardService: FlashcardService,
    private translationService: TranslationService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.loadCards();
    
    // Apply dark mode on initialization
    this.applyDarkMode(this.isDarkMode());
    
    // Watch for dark mode changes
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyDarkMode(isDark);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
      }
    });
  }

  private getInitialDarkMode(): boolean {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) {
        return stored === 'true';
      }
    }
    
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
  }

  private applyDarkMode(isDark: boolean): void {
    if (this.elementRef?.nativeElement) {
      if (isDark) {
        this.renderer.setAttribute(this.elementRef.nativeElement, 'data-theme', 'dark');
      } else {
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'data-theme');
      }
    }
  }

  protected toggleDarkMode(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  protected toggleTechStack(): void {
    this.showTechStack.set(!this.showTechStack());
  }

  protected toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  protected getTranslatedText(text: string | undefined): string {
    return this.translationService.translateText(text, this.currentLanguage());
  }

  private loadCards(): void {
    this.flashcardService.getAll().subscribe({
      next: (cards) => this.cards.set(cards),
      error: (error) => console.error('Error loading cards:', error)
    });
  }

  protected openAddCardModal(): void {
    this.showAddCardModal.set(true);
    this.errorMessage.set('');
    this.formData = { frontText: '', backText: '' };
  }

  protected closeAddCardModal(): void {
    this.showAddCardModal.set(false);
    this.errorMessage.set('');
    this.formData = { frontText: '', backText: '' };
  }

  protected submitCard(): void {
    if (!this.formData.frontText.trim() || !this.formData.backText.trim()) {
      this.errorMessage.set('Both front and back text are required');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const newCard: Flashcard = {
      FrontText: this.formData.frontText.trim(),
      BackText: this.formData.backText.trim()
    };

    this.flashcardService.create(newCard).subscribe({
      next: (card) => {
        this.cards.set([...this.cards(), card]);
        this.closeAddCardModal();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to create card');
      }
    });
  }

  protected toggleCardFlip(cardId: string | undefined): void {
    if (!cardId) return;

    const flipped = new Set(this.flippedCardIds());
    if (flipped.has(cardId)) {
      flipped.delete(cardId);
    } else {
      flipped.add(cardId);
    }
    this.flippedCardIds.set(flipped);
  }

  protected isCardFlipped(cardId: string | undefined): boolean {
    return cardId ? this.flippedCardIds().has(cardId) : false;
  }

  protected flipAllCards(): void {
    const currentCards = this.filteredCards();
    if (currentCards.length === 0) return;

    if (this.areAllCardsFlipped()) {
      // Reset all cards to front
      this.flippedCardIds.set(new Set());
    } else {
      // Flip all cards to back
      const allIds = new Set<string>();
      currentCards.forEach(card => {
        if (card.id) allIds.add(card.id);
      });
      this.flippedCardIds.set(allIds);
    }
  }

  protected toggleCardSelection(cardId: string | undefined): void {
    if (!cardId) return;
    
    const selected = new Set(this.selectedCardIds());
    if (selected.has(cardId)) {
      selected.delete(cardId);
    } else {
      selected.add(cardId);
    }
    this.selectedCardIds.set(selected);
  }

  protected isCardSelected(cardId: string | undefined): boolean {
    return cardId ? this.selectedCardIds().has(cardId) : false;
  }

  protected hasSelectedCards(): boolean {
    return this.selectedCardIds().size > 0;
  }

  protected deleteSelectedCards(): void {
    const selectedIds = Array.from(this.selectedCardIds());
    if (selectedIds.length === 0) return;

    if (!confirm(`Delete ${selectedIds.length} card(s)?`)) return;

    this.isSubmitting.set(true);
    let deletedCount = 0;

    selectedIds.forEach((id) => {
      this.flashcardService.delete(id).subscribe({
        next: () => {
          deletedCount++;
          if (deletedCount === selectedIds.length) {
            // All deletions complete
            this.cards.set(this.cards().filter(card => !selectedIds.includes(card.id || '')));
            
            // Cleanup selection and flip sets
            const updatedSelected = new Set(this.selectedCardIds());
            const updatedFlipped = new Set(this.flippedCardIds());
            selectedIds.forEach(deletedId => {
              updatedSelected.delete(deletedId);
              updatedFlipped.delete(deletedId);
            });
            this.selectedCardIds.set(updatedSelected);
            this.flippedCardIds.set(updatedFlipped);

            this.isSubmitting.set(false);
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to delete card');
        }
      });
    });
  }
}

