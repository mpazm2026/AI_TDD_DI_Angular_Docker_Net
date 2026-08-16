using Flashcards.Core.Entities;

namespace Flashcards.Core.Services;

public interface IFlashcardManager
{
    Task<Flashcard> SaveCardAsync(Flashcard card);
    Task<IEnumerable<Flashcard>> GetAllCardsAsync();
    Task<Flashcard?> GetByIdAsync(string id);
    Task<Flashcard> UpdateCardAsync(Flashcard card);
    Task DeleteCardAsync(string id);
}
