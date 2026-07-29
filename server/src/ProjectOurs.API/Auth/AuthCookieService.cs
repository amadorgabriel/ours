namespace ProjectOurs.API.Auth;

public static class AuthCookie
{
    public const string Name = "po_auth";
}

public sealed class AuthCookieService(IHostEnvironment environment)
{
    private bool UseSecureCookies =>
        !environment.IsDevelopment() && !environment.IsEnvironment("Testing");

    public void Append(HttpResponse response, string jwt)
    {
        response.Cookies.Append(AuthCookie.Name, jwt, new CookieOptions
        {
            HttpOnly = true,
            // Disabled in Development/Testing so cookies work over local HTTP; Production keeps Secure.
            Secure = UseSecureCookies,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7),
        });
    }

    public void Delete(HttpResponse response)
    {
        response.Cookies.Delete(AuthCookie.Name, new CookieOptions
        {
            HttpOnly = true,
            Path = "/",
            Secure = UseSecureCookies,
            SameSite = SameSiteMode.Lax,
        });
    }
}
