using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Flashcards.Core.Entities;
using Flashcards.Core.Services;

namespace Flashcards.Infrastructure.Data;

public class DynamoDbFlashcardsRepository : IFlashcardRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public DynamoDbFlashcardsRepository()
        : this(new AmazonDynamoDBClient(), "Flashcards")
    {
    }

    public DynamoDbFlashcardsRepository(IAmazonDynamoDB dynamoDb, string tableName = "Flashcards")
    {
        _dynamoDb = dynamoDb ?? throw new ArgumentNullException(nameof(dynamoDb));
        _tableName = string.IsNullOrWhiteSpace(tableName) ? "Flashcards" : tableName;
    }

    public async Task<Flashcard> SaveCardAsync(Flashcard card)
    {
        ArgumentNullException.ThrowIfNull(card);

        if (string.IsNullOrWhiteSpace(card.Id))
        {
            card.Id = Guid.NewGuid().ToString();
        }

        if (card.CreatedAt == default)
        {
            card.CreatedAt = DateTime.UtcNow;
        }

        var item = new Dictionary<string, AttributeValue>
        {
            ["Id"] = new AttributeValue { S = card.Id },
            ["FrontText"] = new AttributeValue { S = card.FrontText },
            ["BackText"] = new AttributeValue { S = card.BackText },
            ["CreatedAt"] = new AttributeValue { S = card.CreatedAt.ToString("O") }
        };

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        });

        return card;
    }

    public async Task<IEnumerable<Flashcard>> GetAllCardsAsync()
    {
        var response = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = _tableName
        });

        return response.Items.Select(MapFromItem).ToList();
    }

    public async Task<Flashcard?> GetByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("Id is required.");
        }

        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["Id"] = new AttributeValue { S = id }
            }
        });

        return response.Item is null || response.Item.Count == 0 ? null : MapFromItem(response.Item);
    }

    public async Task<Flashcard> UpdateCardAsync(Flashcard card)
    {
        ArgumentNullException.ThrowIfNull(card);

        if (string.IsNullOrWhiteSpace(card.Id))
        {
            throw new ArgumentException("Id is required.");
        }

        var existingCard = await GetByIdAsync(card.Id);
        if (existingCard is null)
        {
            throw new KeyNotFoundException($"Flashcard with id '{card.Id}' was not found.");
        }

        card.CreatedAt = existingCard.CreatedAt == default ? DateTime.UtcNow : existingCard.CreatedAt;

        var item = new Dictionary<string, AttributeValue>
        {
            ["Id"] = new AttributeValue { S = card.Id },
            ["FrontText"] = new AttributeValue { S = card.FrontText },
            ["BackText"] = new AttributeValue { S = card.BackText },
            ["CreatedAt"] = new AttributeValue { S = card.CreatedAt.ToString("O") }
        };

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        });

        return card;
    }

    public async Task DeleteCardAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("Id is required.");
        }

        await _dynamoDb.DeleteItemAsync(new DeleteItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["Id"] = new AttributeValue { S = id }
            }
        });
    }

    public Task<IEnumerable<Flashcard>> GetAllCardAsync() => GetAllCardsAsync();

    private static Flashcard MapFromItem(Dictionary<string, AttributeValue> item)
    {
        string id = GetAttributeString(item, "Id", "id", "cardId", "card_id");
        string frontText = GetAttributeString(item, "FrontText", "frontText", "front_text", "front", "question");
        string backText = GetAttributeString(item, "BackText", "backText", "back_text", "back", "answer");
        DateTime createdAt = DateTime.UtcNow;

        var createdAtStr = GetAttributeString(item, "CreatedAt", "createdAt", "created_at", "created");
        if (DateTime.TryParse(createdAtStr, out var parsedCreatedAt))
        {
            createdAt = parsedCreatedAt;
        }

        // If frontText or backText is missing and the Id is formatted as a raw JSON string
        if (string.IsNullOrWhiteSpace(frontText) && !string.IsNullOrWhiteSpace(id) && id.TrimStart().StartsWith('{'))
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(id);
                var root = doc.RootElement;

                if (root.TryGetProperty("Id", out var idProp) || root.TryGetProperty("id", out idProp))
                {
                    id = idProp.GetString() ?? id;
                }
                if (root.TryGetProperty("FrontText", out var frontProp) || root.TryGetProperty("frontText", out frontProp) || root.TryGetProperty("question", out frontProp))
                {
                    frontText = frontProp.GetString() ?? string.Empty;
                }
                if (root.TryGetProperty("BackText", out var backProp) || root.TryGetProperty("backText", out backProp) || root.TryGetProperty("answer", out backProp))
                {
                    backText = backProp.GetString() ?? string.Empty;
                }
                if ((root.TryGetProperty("CreatedAt", out var createdProp) || root.TryGetProperty("createdAt", out createdProp))
                    && DateTime.TryParse(createdProp.GetString(), out var innerCreatedAt))
                {
                    createdAt = innerCreatedAt;
                }
            }
            catch
            {
                // Fallback to original values if JSON parse fails
            }
        }

        if (string.IsNullOrWhiteSpace(id))
        {
            id = Guid.NewGuid().ToString();
        }

        return new Flashcard
        {
            Id = id,
            FrontText = frontText,
            BackText = backText,
            CreatedAt = createdAt
        };
    }

    private static string GetAttributeString(Dictionary<string, AttributeValue> item, params string[] keys)
    {
        foreach (var key in keys)
        {
            var match = item.FirstOrDefault(k => string.Equals(k.Key, key, StringComparison.OrdinalIgnoreCase));
            if (match.Value is not null && !string.IsNullOrWhiteSpace(match.Value.S))
            {
                return match.Value.S;
            }
        }
        return string.Empty;
    }
}
