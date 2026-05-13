using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Auth;
using ProjectOurs.API.Options;

namespace ProjectOurs.API.Auth;

public sealed class GoogleIdTokenValidator(IOptions<GoogleAuthSettings> options) : IGoogleIdTokenValidator
{
    private readonly GoogleAuthSettings _google = options.Value;

    public async Task<GoogleTokenPayload> ValidateAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_google.ClientId) ||
            _google.ClientId.StartsWith("your-google", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Authentication:Google:ClientId is not configured. Set a valid Web client ID in appsettings or user secrets.");
        }

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_google.ClientId],
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (string.IsNullOrWhiteSpace(payload.Email))
            {
                throw new GoogleTokenInvalidException("Google token has no email claim.");
            }

            return new GoogleTokenPayload(
                payload.Email,
                payload.EmailVerified,
                payload.Name,
                payload.Picture);
        }
        catch (InvalidJwtException ex)
        {
            throw new GoogleTokenInvalidException(inner: ex);
        }
        catch (GoogleTokenInvalidException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new GoogleTokenInvalidException(inner: ex);
        }
    }
}
