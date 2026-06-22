using System.Net.Http.Json;
using System.Text.Json;

namespace ProjectOurs.Api.IntegrationTests.Support;

public static class IntegrationHttpClientExtensions
{
    public static async Task<string> GetAntiforgeryTokenAsync(this HttpClient client)
    {
        var response = await client.GetAsync("/api/auth/antiforgery");
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        return payload.GetProperty("requestToken").GetString()
            ?? throw new InvalidOperationException("Antiforgery response did not include requestToken.");
    }

    public static async Task<HttpResponseMessage> PostJsonWithAntiforgeryAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        var token = await client.GetAntiforgeryTokenAsync();
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("RequestVerificationToken", token);
        return await client.SendAsync(request);
    }

    public static async Task<HttpResponseMessage> PostJsonAsMobileClientAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("X-Client-Platform", "mobile");
        return await client.SendAsync(request);
    }

    public static async Task<HttpResponseMessage> PatchJsonAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, url)
        {
            Content = JsonContent.Create(body),
        };
        return await client.SendAsync(request);
    }

    public static async Task<HttpResponseMessage> DeleteJsonAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, url)
        {
            Content = JsonContent.Create(body),
        };
        return await client.SendAsync(request);
    }

    public static async Task<HttpResponseMessage> PatchJsonAsMobileClientAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, url)
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("X-Client-Platform", "mobile");
        return await client.SendAsync(request);
    }

    public static async Task<HttpResponseMessage> DeleteJsonAsMobileClientAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, url)
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("X-Client-Platform", "mobile");
        return await client.SendAsync(request);
    }
}
