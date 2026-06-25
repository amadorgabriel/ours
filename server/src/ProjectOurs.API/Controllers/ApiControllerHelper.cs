using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.API.Auth;
using ProjectOurs.Application.Family;

namespace ProjectOurs.API.Controllers;

internal static class ApiControllerHelper
{
    public static bool TryGetUserId(ClaimsPrincipal user, out Guid userId)
    {
        var subject = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.TryParse(subject, out userId);
    }

    public static async Task<IActionResult?> ValidateAntiforgeryAsync(
        HttpContext httpContext,
        IAntiforgery antiforgery)
    {
        if (MobileClientHeaders.ShouldSkipAntiforgery(httpContext.Request))
        {
            return null;
        }

        try
        {
            await antiforgery.ValidateRequestAsync(httpContext);
            return null;
        }
        catch (AntiforgeryValidationException)
        {
            return new BadRequestObjectResult(new { message = "Invalid antiforgery token." });
        }
    }

    public static IActionResult MapFamilyException(Exception exception) =>
        exception switch
        {
            FamilyValidationException ex => new BadRequestObjectResult(new { message = ex.Message }),
            FamilyNotFoundException ex => new NotFoundObjectResult(new { message = ex.Message }),
            FamilyForbiddenException ex => new ObjectResult(new { message = ex.Message })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            },
            FamilyConflictException ex => new ConflictObjectResult(new { message = ex.Message }),
            _ => new ObjectResult(new { message = "An unexpected error occurred." })
            {
                StatusCode = StatusCodes.Status500InternalServerError,
            },
        };
}
