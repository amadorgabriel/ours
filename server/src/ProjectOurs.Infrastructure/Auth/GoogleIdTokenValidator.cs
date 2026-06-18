using Google.Apis.Auth;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Auth;
using ProjectOurs.Infrastructure.Options;

namespace ProjectOurs.Infrastructure.Auth;

public sealed class GoogleIdTokenValidator(
    IOptions<GoogleAuthOptions> googleOptions,
    IHostEnvironment environment) : IGoogleIdTokenValidator
{
    public const string DevMockToken = "dev-mock-id-token";

    public async Task<GoogleUserPayload> ValidateAsync(
        string idToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            throw new InvalidOperationException("Google id token is required.");
        }

        if ((environment.IsDevelopment() || environment.IsEnvironment("Testing")) && idToken == DevMockToken)
        {
            return new GoogleUserPayload(
                "dev@projectours.local",
                "Dev User",
                null);
        }

        var audiences = new List<string>();
        if (!string.IsNullOrWhiteSpace(googleOptions.Value.ClientId))
        {
            audiences.Add(googleOptions.Value.ClientId);
        }

        if (!string.IsNullOrWhiteSpace(googleOptions.Value.AndroidClientId))
        {
            audiences.Add(googleOptions.Value.AndroidClientId);
        }

        if (audiences.Count == 0)
        {
            throw new InvalidOperationException("Google OAuth client ID is not configured.");
        }

        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = audiences,
        };

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            throw new InvalidOperationException("Google account email is required.");
        }

        if (!payload.EmailVerified)
        {
            throw new InvalidOperationException("Google account email is not verified.");
        }

        return new GoogleUserPayload(
            payload.Email,
            payload.Name ?? payload.Email,
            payload.Picture);
    }
}
