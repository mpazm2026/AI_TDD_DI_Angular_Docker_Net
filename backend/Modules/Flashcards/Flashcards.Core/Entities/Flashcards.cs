namespace Flashcards.Core.Entities;
public class Flashcard
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}