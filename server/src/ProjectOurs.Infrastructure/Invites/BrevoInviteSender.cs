using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using ProjectOurs.Application.Family;

namespace ProjectOurs.Infrastructure.Invites;

public sealed class BrevoInviteSender(
    HttpClient httpClient,
    IOptions<BrevoOptions> brevoOptions,
    IOptions<InviteLinkOptions> inviteOptions) : IInviteEmailSender
{
    public const string SmtpEmailUrl = "https://api.brevo.com/v3/smtp/email";

    public async Task SendAsync(string? invitedEmail, string inviteCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(invitedEmail))
        {
            return;
        }

        var brevo = brevoOptions.Value;
        if (string.IsNullOrWhiteSpace(brevo.ApiKey) || string.IsNullOrWhiteSpace(brevo.SenderEmail))
        {
            throw new InviteDeliveryException("Brevo is not configured.");
        }

        var link = InviteLinks.Build(inviteOptions.Value.BaseUrl, inviteCode);
        var payload = new
        {
            sender = new { email = brevo.SenderEmail, name = "Ours" },
            to = new[] { new { email = invitedEmail.Trim() } },
            subject = "Convite para a família",
            htmlContent = $"<p>Código {inviteCode}</p><p><a href=\"{link}\">{link}</a></p>",
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, SmtpEmailUrl);
        request.Headers.TryAddWithoutValidation("api-key", brevo.ApiKey);
        request.Content = JsonContent.Create(payload);

        var response = await httpClient.SendAsync(request, cancellationToken);
        if ((int)response.StatusCode != 201)
        {
            throw new InviteDeliveryException($"Brevo returned {(int)response.StatusCode}.");
        }
    }
}
