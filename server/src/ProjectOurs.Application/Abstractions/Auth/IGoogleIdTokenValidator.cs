using ProjectOurs.Application.Auth;

namespace ProjectOurs.Application.Abstractions.Auth;

public interface IGoogleIdTokenValidator
{
    Task<GoogleUserPayload> ValidateAsync(string idToken, CancellationToken cancellationToken = default);
}
