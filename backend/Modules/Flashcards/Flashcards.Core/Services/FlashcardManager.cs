using Flashcards.Core.Entities;

namespace Flashcards.Core.Services;

public class FlashcardManager : IFlashcardManager
{
    private readonly IFlashcardRepository _repository;

    public FlashcardManager(IFlashcardRepository repository)
    {
        _repository = repository;
    }

    public async Task<Flashcard> SaveCardAsync(Flashcard card)
    {
        ArgumentNullException.ThrowIfNull(card);
        ValidateCard(card);

        return await _repository.SaveCardAsync(card);
    }

    public async Task<IEnumerable<Flashcard>> GetAllCardsAsync()
    {
        return await _repository.GetAllCardsAsync();
    }

    public async Task<Flashcard?> GetByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("Id is required.");
        }

        return await _repository.GetByIdAsync(id);
    }

    public async Task<Flashcard> UpdateCardAsync(Flashcard card)
    {
        ArgumentNullException.ThrowIfNull(card);
        ValidateCard(card);

        if (string.IsNullOrWhiteSpace(card.Id))
        {
            throw new ArgumentException("Id is required.");
        }

        return await _repository.UpdateCardAsync(card);
    }

    public async Task DeleteCardAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("Id is required.");
        }

        await _repository.DeleteCardAsync(id);
    }

    private static void ValidateCard(Flashcard card)
    {
        if (string.IsNullOrWhiteSpace(card.FrontText))
        {
            throw new ArgumentException("FrontText is required.");
        }

        if (string.IsNullOrWhiteSpace(card.BackText))
        {
            throw new ArgumentException("BackText is required.");
        }
    }
}
