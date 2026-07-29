namespace ProjectOurs.Application.Family;

public static class FamilyRules
{
    public const int MinNameLength = 1;
    public const int MaxNameLength = 100;
    public const int InviteCodeLength = 6;
    public static readonly TimeSpan InviteValidity = TimeSpan.FromHours(24);

    public static bool IsValidName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return false;
        }

        var trimmed = name.Trim();
        return trimmed.Length >= MinNameLength && trimmed.Length <= MaxNameLength;
    }

    public static string NormalizeName(string name) => name.Trim();

    public static string NormalizeInviteCode(string inviteCode) =>
        inviteCode.Trim().ToUpperInvariant();
}
