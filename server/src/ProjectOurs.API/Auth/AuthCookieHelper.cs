using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using ProjectOurs.API.Options;

namespace ProjectOurs.API.Auth;

public static class AuthCookieHelper
{
    public static void AppendAuthCookie(
        HttpResponse response,
        string accessToken,
        IOptions<JwtSettings> jwtOptions,
        IHostEnvironment environment)
    {
        var jwt = jwtOptions.Value;
        response.Cookies.Append(
            jwt.AuthCookieName,
            accessToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = environment.IsProduction(),
                SameSite = SameSiteMode.Lax,
                Path = "/",
                MaxAge = TimeSpan.FromHours(jwt.ExpirationHours),
                IsEssential = true,
            });
    }

    public static void DeleteAuthCookie(HttpResponse response, IOptions<JwtSettings> jwtOptions)
    {
        var name = jwtOptions.Value.AuthCookieName;
        response.Cookies.Delete(
            name,
            new CookieOptions
            {
                Path = "/",
            });
    }
}
