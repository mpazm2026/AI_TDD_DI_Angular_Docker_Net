using Flashcards.Core.Entities;
using Flashcards.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Flashcards.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlashcardsController : ControllerBase
{
    private readonly IFlashcardManager _manager;

    public FlashcardsController(IFlashcardManager manager)
    {
        _manager = manager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Flashcard>>> GetAll()
    {
        var cards = await _manager.GetAllCardsAsync();
        return Ok(cards);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Flashcard>> GetById(string id)
    {
        var card = await _manager.GetByIdAsync(id);
        if (card is null)
        {
            return NotFound();
        }

        return Ok(card);
    }

    [HttpPost]
    public async Task<ActionResult<Flashcard>> Create([FromBody] Flashcard card)
    {
        var created = await _manager.SaveCardAsync(card);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Flashcard>> Update(string id, [FromBody] Flashcard card)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest("Id is required.");
        }

        card.Id = id;

        try
        {
            var updated = await _manager.UpdateCardAsync(card);
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            await _manager.DeleteCardAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
