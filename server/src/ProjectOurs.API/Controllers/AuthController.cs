using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.API.Auth;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Auth;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    AuthService authService,
    IUserRepository users,
    IJwtTokenFactory jwtTokenFactory,
    AuthCookieService cookieService,
    IAntiforgery antiforgery,
    ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("google")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LoginWithGoogle(
        [FromBody] GoogleAuthRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest(new { message = "idToken is required." });
        }

        if (!MobileClientHeaders.ShouldSkipAntiforgery(Request))
        {
            try
            {
                await antiforgery.ValidateRequestAsync(HttpContext);
            }
            catch (AntiforgeryValidationException)
            {
                return BadRequest(new { message = "Invalid antiforgery token." });
            }
        }

        try
        {
            var session = await authService.LoginWithGoogleAsync(request.IdToken, cancellationToken);
            if (!Guid.TryParse(session.User.Id, out var userId))
            {
                logger.LogError("Login succeeded but user id is not a valid GUID: {UserId}", session.User.Id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Invalid user ID format." });
            }

            var token = jwtTokenFactory.CreateToken(
                userId,
                session.User.Email,
                session.User.Name);
            cookieService.Append(Response, token);
            return Ok(session with { AccessToken = token });
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Google login failed.");
            return BadRequest(new { message = "Authentication failed. Please try again." });
        }
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(AuthSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSession(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var user = await users.GetByIdWithMembershipsAsync(userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(authService.BuildSession(user, isNewUser: false));
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (!MobileClientHeaders.ShouldSkipAntiforgery(Request))
        {
            try
            {
                await antiforgery.ValidateRequestAsync(HttpContext);
            }
            catch (AntiforgeryValidationException)
            {
                return BadRequest(new { message = "Invalid antiforgery token." });
            }
        }

        cookieService.Delete(Response);
        return Ok();
    }

    [HttpGet("antiforgery")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AntiforgeryResponse), StatusCodes.Status200OK)]
    public IActionResult GetAntiforgeryToken()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new AntiforgeryResponse(tokens.RequestToken ?? string.Empty));
    }

    private bool TryGetUserId(out Guid userId)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.NameId)?.Value;

        return Guid.TryParse(subject, out userId);
    }
}
