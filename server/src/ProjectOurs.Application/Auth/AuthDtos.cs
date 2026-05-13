using System.Text.Json.Serialization;

namespace ProjectOurs.Application.Auth;

public sealed record GoogleLoginRequest(
    [property: JsonPropertyName("idToken")] string IdToken);

public sealed record AuthResponse(
    UserDto User,
    [property: JsonPropertyName("isNewUser")] bool IsNewUser,
    [property: JsonPropertyName("familyCount")] int FamilyCount);

public sealed record UserDto(
    Guid Id,
    string Email,
    string Name,
    string? Picture,
    IReadOnlyList<UserFamilyDto> Families);

public sealed record UserFamilyDto(
    Guid Id,
    string Name,
    string Role);

public sealed record ActiveFamilyResponse(
    Guid FamilyId,
    string FamilyName,
    string Role);
