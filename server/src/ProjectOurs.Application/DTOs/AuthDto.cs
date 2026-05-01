namespace ProjectOurs.Application.DTOs;

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
    public bool IsNewUser { get; set; }
    public bool HasFamily { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public string Role { get; set; } = string.Empty;
    public Guid? FamilyId { get; set; }
}
