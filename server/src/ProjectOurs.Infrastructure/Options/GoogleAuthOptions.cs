namespace ProjectOurs.Infrastructure.Options;

public sealed class GoogleAuthOptions
{
    public const string SectionName = "Authentication:Google";

    public string ClientId { get; set; } = string.Empty;

    /// <summary>OAuth Android client ID — optional second audience for mobile idTokens.</summary>
    public string? AndroidClientId { get; set; }
}
