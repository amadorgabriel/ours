using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using ProjectOurs.API.Auth;
using ProjectOurs.API.Options;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Auth;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IAuthService authService,
    IOptions<JwtSettings> jwtOptions,
    IHostEnvironment environment) : ControllerBase
{
    [HttpGet("antiforgery")]
    [IgnoreAntiforgeryToken]
    public IActionResult GetAntiforgery([FromServices] IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { requestToken = tokens.RequestToken });
    }

    [Authorize]
    [HttpGet("session")]
    [IgnoreAntiforgeryToken]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Session() => NoContent();

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> Google([FromBody] GoogleLoginRequest body, CancellationToken cancellationToken)
    {
        try
        {
            var login = await authService.SignInWithGoogleAsync(body.IdToken, cancellationToken);
            AuthCookieHelper.AppendAuthCookie(Response, login.AccessToken, jwtOptions, environment);
            return Ok(login.Response);
        }
        catch (EmailNotVerifiedException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Google email is not verified." });
        }
        catch (GoogleTokenInvalidException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("refresh")]
    [IgnoreAntiforgeryToken]
    public IActionResult Refresh() => StatusCode(StatusCodes.Status501NotImplemented);

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        AuthCookieHelper.DeleteAuthCookie(Response, jwtOptions);
        return NoContent();
    }
}
