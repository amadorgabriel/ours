namespace ProjectOurs.API.Auth;

public static class AuthCookie
{
    public const string Name = "po_auth";
}

public sealed class AuthCookieService(IHostEnvironment environment)
{
    public void Append(HttpResponse response, string jwt)
    {
        response.Cookies.Append(AuthCookie.Name, jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7),
        });
    }

    public void Delete(HttpResponse response)
    {
        response.Cookies.Delete(AuthCookie.Name, new CookieOptions
        {
            Path = "/",
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
        });
    }
}
