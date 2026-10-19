using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Options;
using ProjectOurs.Infrastructure.Invites;
using Xunit;

namespace ProjectOurs.UnitTests.Invites;

public sealed class BrevoInviteSenderTests
{
    [Fact]
    public async Task SkipsBrevoWhenEmailMissing()
    {
        var handler = new RecordingHandler();
        var sender = CreateSender(handler);

        await sender.SendAsync(null, "AB12CD");
        await sender.SendAsync("   ", "AB12CD");

        Assert.Null(handler.Request);
    }

    [Fact]
    public async Task PostsSmtpEmailWithJoinLink()
    {
        const string apiKey = "chave-de-teste";
        Environment.SetEnvironmentVariable("BREVO_API_KEY", apiKey);
        Environment.SetEnvironmentVariable("BREVO_SENDER_EMAIL", "remetente@exemplo.com");

        var handler = new RecordingHandler(HttpStatusCode.Created);
        var sender = CreateSender(
            handler,
            Environment.GetEnvironmentVariable("BREVO_API_KEY")!,
            Environment.GetEnvironmentVariable("BREVO_SENDER_EMAIL")!,
            "https://exemplo.vercel.app");

        await sender.SendAsync("ana@exemplo.com", "AB12CD");

        var request = handler.Request;
        Assert.NotNull(request);
        Assert.Equal("https://api.brevo.com/v3/smtp/email", request!.RequestUri!.ToString());
        Assert.Equal(apiKey, request.Headers.GetValues("api-key").Single());

        var body = handler.Body ?? string.Empty;
        using var document = JsonDocument.Parse(body);
        Assert.Equal(
            Environment.GetEnvironmentVariable("BREVO_SENDER_EMAIL"),
            document.RootElement.GetProperty("sender").GetProperty("email").GetString());
        Assert.Equal("ana@exemplo.com", document.RootElement.GetProperty("to")[0].GetProperty("email").GetString());
        Assert.Contains("https://exemplo.vercel.app/join/AB12CD", body);
        Assert.DoesNotContain("ours.app", body);
        Assert.DoesNotContain("RESEND_API_KEY", body);
        Assert.DoesNotContain("resend", body, StringComparison.OrdinalIgnoreCase);
    }

    private static BrevoInviteSender CreateSender(
        RecordingHandler handler,
        string apiKey = "chave-de-teste",
        string senderEmail = "remetente@exemplo.com",
        string baseUrl = "https://exemplo.vercel.app")
    {
        return new BrevoInviteSender(
            new HttpClient(handler),
            Options.Create(new BrevoOptions { ApiKey = apiKey, SenderEmail = senderEmail }),
            Options.Create(new InviteLinkOptions { BaseUrl = baseUrl }));
    }

    private sealed class RecordingHandler : HttpMessageHandler
    {
        private readonly HttpStatusCode _status;

        public RecordingHandler(HttpStatusCode status = HttpStatusCode.Created)
        {
            _status = status;
        }

        public HttpRequestMessage? Request { get; private set; }

        public string? Body { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Request = request;
            Body = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
            return new HttpResponseMessage(_status);
        }
    }
}
