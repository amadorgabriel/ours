namespace ProjectOurs.API.Options;

public sealed class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SigningKey { get; set; } = string.Empty;
    public int ExpirationHours { get; set; } = 24;
    public string AuthCookieName { get; set; } = "po_auth";
}
