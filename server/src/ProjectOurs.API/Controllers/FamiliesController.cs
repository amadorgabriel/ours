using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.Family;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/families")]
[Authorize]
public sealed class FamiliesController(
    FamilyService familyService,
    IAntiforgery antiforgery,
    ILogger<FamiliesController> logger) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(FamilyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateFamily(
        [FromBody] CreateFamilyRequest request,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        var antiforgeryError = await ApiControllerHelper.ValidateAntiforgeryAsync(HttpContext, antiforgery);
        if (antiforgeryError is not null)
        {
            return antiforgeryError;
        }

        try
        {
            var family = await familyService.CreateFamilyAsync(userId, request.Name, cancellationToken);
            return Ok(family);
        }
        catch (FamilyValidationException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create family for user {UserId}.", userId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }

    [HttpGet("my")]
    [ProducesResponseType(typeof(IReadOnlyList<FamilyWithRoleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ListMine(CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        var families = await familyService.ListMineAsync(userId, cancellationToken);
        return Ok(families);
    }
}
