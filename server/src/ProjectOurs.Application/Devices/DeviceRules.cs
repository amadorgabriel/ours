namespace ProjectOurs.Application.Devices;

public static class DeviceRules
{
    public const int MaxPushTokenLength = 500;

    private static readonly HashSet<string> AllowedPlatforms =
        new(StringComparer.OrdinalIgnoreCase) { "ios", "android" };

    public static bool IsValidPushToken(string? pushToken) =>
        !string.IsNullOrWhiteSpace(pushToken)
        && pushToken.Trim().Length <= MaxPushTokenLength;

    public static bool IsValidPlatform(string? platform) =>
        !string.IsNullOrWhiteSpace(platform)
        && AllowedPlatforms.Contains(platform.Trim());

    public static string NormalizePlatform(string platform) =>
        platform.Trim().ToLowerInvariant();
}
