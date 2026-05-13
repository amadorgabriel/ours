namespace ProjectOurs.Application.Auth;

public sealed record GoogleTokenPayload(
    string Email,
    bool EmailVerified,
    string? Name,
    string? Picture);
