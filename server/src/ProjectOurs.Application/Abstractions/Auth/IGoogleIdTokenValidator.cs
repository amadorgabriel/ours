using ProjectOurs.Application.Auth;

namespace ProjectOurs.Application.Abstractions.Auth;

public interface IGoogleIdTokenValidator
{
    Task<GoogleTokenPayload> ValidateAsync(string idToken, CancellationToken cancellationToken = default);
}
