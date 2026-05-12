namespace ProjectOurs.API.Options;

public sealed class GoogleAuthSettings
{
    public const string SectionName = "Authentication:Google";

    public string ClientId { get; set; } = "placeholder-google-client-id";
}
