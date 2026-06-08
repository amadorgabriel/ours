using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.Common;
using ProjectOurs.Application.Family;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public sealed class InvitesController(
    FamilyService familyService,
    IAntiforgery antiforgery,
    ILogger<InvitesController> logger) : ControllerBase
{
    [HttpPost("invite")]
    [ProducesResponseType(typeof(InviteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateInvite(
        [FromBody] CreateInviteRequest request,
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

        if (!Request.Headers.TryGetValue(FamilyHeaders.FamilyId, out var familyIdHeader)
            || !Guid.TryParse(familyIdHeader.FirstOrDefault(), out var familyId))
        {
            return BadRequest(new { message = "Active family not specified." });
        }

        try
        {
            var invite = await familyService.CreateInviteAsync(
                userId,
                familyId,
                request.InvitedEmail,
                cancellationToken);
            return Ok(invite);
        }
        catch (FamilyForbiddenException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create invite for user {UserId} in family {FamilyId}.", userId, familyId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }

    [HttpPost("join")]
    [ProducesResponseType(typeof(JoinResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> JoinWithCode(
        [FromBody] JoinRequest request,
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
            var result = await familyService.JoinWithCodeAsync(userId, request.InviteCode, cancellationToken);
            return Ok(result);
        }
        catch (FamilyValidationException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (FamilyNotFoundException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (FamilyConflictException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to join family for user {UserId}.", userId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }
}
