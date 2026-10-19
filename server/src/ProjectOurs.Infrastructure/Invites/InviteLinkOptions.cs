namespace ProjectOurs.Infrastructure.Invites;

public sealed class InviteLinkOptions
{
    public const string SectionName = "Invite";

    public string BaseUrl { get; set; } = string.Empty;
}

public static class InviteLinks
{
    public static string Build(string? baseUrl, string inviteCode)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return $"projectours://join/{inviteCode}";
        }

        return $"{baseUrl.Trim().TrimEnd('/')}/join/{inviteCode}";
    }
}
