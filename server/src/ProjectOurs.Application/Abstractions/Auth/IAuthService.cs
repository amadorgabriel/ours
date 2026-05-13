using ProjectOurs.Application.Auth;

namespace ProjectOurs.Application.Abstractions.Auth;

public interface IAuthService
{
    Task<AuthLoginResult> SignInWithGoogleAsync(string idToken, CancellationToken cancellationToken = default);
}

public sealed record AuthLoginResult(AuthResponse Response, string AccessToken);
