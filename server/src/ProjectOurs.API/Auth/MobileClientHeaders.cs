namespace ProjectOurs.API.Auth;

public static class MobileClientHeaders
{
    public const string PlatformHeader = "X-Client-Platform";
    public const string PlatformValue = "mobile";

    public static bool IsMobileClient(HttpRequest request)
    {
        return request.Headers.TryGetValue(PlatformHeader, out var value)
            && string.Equals(value, PlatformValue, StringComparison.OrdinalIgnoreCase);
    }

    public static bool HasBearerAuthorization(HttpRequest request)
    {
        var authorization = request.Headers.Authorization.ToString();
        return authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase);
    }

    public static bool ShouldSkipAntiforgery(HttpRequest request)
    {
        return IsMobileClient(request) || HasBearerAuthorization(request);
    }
}
