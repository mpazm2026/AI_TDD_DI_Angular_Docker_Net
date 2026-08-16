using Flashcards.Controllers;
using Flashcards.Core.Entities;
using Flashcards.Core.Services;
using NSubstitute;

namespace Flashcards.Tests;

public class FlashcardManagerTests
{
    private readonly IFlashcardRepository _repository;
    private readonly FlashcardManager _sut;

    public FlashcardManagerTests()
    {
        _repository = Substitute.For<IFlashcardRepository>();
        _sut = new FlashcardManager(_repository);
    }

    [Fact]
    public async Task SaveCardAsync_ShouldThrow_WhenFrontTextIsEmpty()
    {
        var card = new Flashcard
        {
            FrontText = string.Empty,
            BackText = "Back side"
        };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _sut.SaveCardAsync(card));

        Assert.Equal("FrontText is required.", exception.Message);
        await _repository.DidNotReceive().SaveCardAsync(Arg.Any<Flashcard>());
    }

    [Fact]
    public async Task SaveCardAsync_ShouldThrow_WhenBackTextIsEmpty()
    {
        var card = new Flashcard
        {
            FrontText = "Front side",
            BackText = string.Empty
        };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _sut.SaveCardAsync(card));

        Assert.Equal("BackText is required.", exception.Message);
        await _repository.DidNotReceive().SaveCardAsync(Arg.Any<Flashcard>());
    }

    [Fact]
    public async Task SaveCardAsync_ShouldCallRepository_WhenCardIsValid()
    {
        var card = new Flashcard
        {
            FrontText = "Front side",
            BackText = "Back side"
        };

        var savedCard = new Flashcard
        {
            Id = card.Id,
            FrontText = card.FrontText,
            BackText = card.BackText,
            CreatedAt = DateTime.UtcNow
        };

        _repository.SaveCardAsync(card).Returns(Task.FromResult(savedCard));

        var result = await _sut.SaveCardAsync(card);

        Assert.Same(savedCard, result);
        await _repository.Received(1).SaveCardAsync(card);
    }
}

public class FlashcardsControllerTests
{
    [Fact]
    public async Task Create_ShouldThrowArgumentException_WhenCardIsInvalid()
    {
        var repository = Substitute.For<IFlashcardRepository>();
        var manager = new FlashcardManager(repository);
        var controller = new FlashcardsController(manager);

        var card = new Flashcard
        {
            FrontText = string.Empty,
            BackText = "Back side"
        };

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => controller.Create(card));

        Assert.Equal("FrontText is required.", exception.Message);
    }
}
