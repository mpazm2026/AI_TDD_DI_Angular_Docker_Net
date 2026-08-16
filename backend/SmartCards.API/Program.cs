using Amazon;
using Amazon.DynamoDBv2;
using Amazon.Runtime;
using DotNetEnv;
using Flashcards.Core.Services;
using Flashcards.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

var envPath = Path.Combine(builder.Environment.ContentRootPath, ".env");
if (File.Exists(envPath))
{
    DotNetEnv.Env.Load(envPath);
}

builder.Configuration.AddEnvironmentVariables();

var awsAccessKeyId = builder.Configuration["AWS_ACCESS_KEY_ID"];
var awsSecretAccessKey = builder.Configuration["AWS_SECRET_ACCESS_KEY"];
var awsRegion = builder.Configuration["AWS_REGION"] ?? "us-east-1";
var dynamoDbTableName = builder.Configuration["DYNAMODB_TABLE_NAME"] ?? "Flashcards";

if (string.IsNullOrWhiteSpace(awsAccessKeyId) || string.IsNullOrWhiteSpace(awsSecretAccessKey))
{
    throw new InvalidOperationException("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be configured in the .env file or environment.");
}

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddSingleton<IAmazonDynamoDB>(_ =>
{
    var credentials = new BasicAWSCredentials(awsAccessKeyId, awsSecretAccessKey);
    var config = new AmazonDynamoDBConfig
    {
        RegionEndpoint = RegionEndpoint.GetBySystemName(awsRegion)
    };

    return new AmazonDynamoDBClient(credentials, config);
});

builder.Services.AddScoped<IFlashcardRepository>(_ =>
    new DynamoDbFlashcardsRepository(_.GetRequiredService<IAmazonDynamoDB>(), dynamoDbTableName));

builder.Services.AddScoped<IFlashcardManager, FlashcardManager>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapControllers();

app.Run();
