namespace ProjectOurs.Application.Auth;

public sealed record GoogleAuthRequest(string IdToken);

public sealed record AuthUserDto(string Id, string Email, string Name, string? Picture);

public sealed record FamilyMembershipDto(string Id, string Name, string Role);

public sealed record AuthSessionResponse(
    AuthUserDto User,
    IReadOnlyList<FamilyMembershipDto> Families,
    bool IsNewUser,
    int FamilyCount,
    string? AccessToken = null);

public sealed record AntiforgeryResponse(string RequestToken);

public sealed record GoogleUserPayload(string Email, string Name, string? Picture);
