using ia_backend;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- OpenAI Action configuration
var openAiApiKey = builder.Configuration.GetSection("openAi").GetValue<string>("apiKey");
if (openAiApiKey is null)
{
    throw new Exception("broken configuration, missing openAI API Key");
}

builder.Services.AddSingleton<OpenAIActions>(s => new OpenAIActions(openAiApiKey));
// --- End of configuration

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapPost("/chat", async (
    [FromBody] string inputText,
    [FromServices] OpenAIActions actions) =>
    {
        JObject response = await actions.Chat(inputText);

        return response.ToString();
    })
    .WithName("Chat")
    .WithOpenApi();

app.Run();