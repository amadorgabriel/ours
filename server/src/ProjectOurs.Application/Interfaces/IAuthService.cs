using ProjectOurs.Application.DTOs;

namespace ProjectOurs.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> AuthenticateWithGoogleAsync(string idToken, CancellationToken cancellationToken = default);
}
