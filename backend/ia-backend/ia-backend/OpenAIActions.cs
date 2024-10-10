// (c) 2024. Domino's IP Holder LLC. All rights reserved.

using System;
using System.Net.Http;
using Newtonsoft.Json;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace ia_backend;

public class OpenAIActions
{
    private readonly string _apiKey;

    public OpenAIActions(string apiKey)
    {
        _apiKey = apiKey;
    }

    // private const string IMAGE_PATH = "YOUR_IMAGE_PATH"; // Set your image path here
    // private const string QUESTION = "YOUR_QUESTION"; // Set your question here

    private const string ENDPOINT  = "https://azure-openao.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview";
    public async Task<JObject> Chat(string text)
    {
        // var encodedImage = Convert.ToBase64String(File.ReadAllBytes(IMAGE_PATH));
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("api-key", _apiKey);
        var payload = new
        {
            messages = new object[]
            {
                new {
                    role = "system",
                    content = new object[] {
                        new {
                            type = "text",
                            text = text
                        }
                    }
                },
                // new {
                //     role = "user",
                //     content = new object[] {
                //         new {
                //             type = "image_url",
                //             image_url = new {
                //                 url = $"data:image/jpeg;base64,{encodedImage}"
                //             }
                //         },
                //         new {
                //             type = "text",
                //             text = QUESTION
                //         }
                //     }
                // }
            },
            temperature = 0.7,
            top_p = 0.95,
            max_tokens = 800,
            stream = false
        };

        var response = await httpClient.PostAsync(ENDPOINT , new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));


        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Error: {response.StatusCode}, {response.ReasonPhrase}");
            return new JObject();
        }

        JObject? responseData = JsonConvert.DeserializeObject<JObject>(await response.Content.ReadAsStringAsync());
        Console.WriteLine(responseData);

        return responseData;
    }
}