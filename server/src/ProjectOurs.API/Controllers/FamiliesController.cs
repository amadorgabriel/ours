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

    [HttpPatch("{familyId:guid}")]
    [ProducesResponseType(typeof(FamilyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFamily(
        Guid familyId,
        [FromBody] UpdateFamilyRequest request,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var family = await familyService.UpdateFamilyAsync(userId, familyId, request.Name, cancellationToken);
            return Ok(family);
        }
        catch (FamilyValidationException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update family {FamilyId} for user {UserId}.", familyId, userId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }

    [HttpDelete("{familyId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFamily(
        Guid familyId,
        [FromBody] DeleteFamilyRequest request,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await familyService.DeleteFamilyAsync(userId, familyId, request.ConfirmName, cancellationToken);
            return NoContent();
        }
        catch (FamilyValidationException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete family {FamilyId} for user {UserId}.", familyId, userId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }

    [HttpGet("{familyId:guid}/members")]
    [ProducesResponseType(typeof(FamilyMemberListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListMembers(
        Guid familyId,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var members = await familyService.ListMembersAsync(userId, familyId, cancellationToken);
            return Ok(members);
        }
        catch (FamilyForbiddenException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to list members for family {FamilyId}, user {UserId}.", familyId, userId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }

    [HttpDelete("{familyId:guid}/members/{memberUserId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RemoveMember(
        Guid familyId,
        Guid memberUserId,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await familyService.RemoveMemberAsync(userId, familyId, memberUserId, cancellationToken);
            return NoContent();
        }
        catch (FamilyConflictException ex)
        {
            return new ConflictObjectResult(new { message = ex.Message });
        }
        catch (FamilyNotFoundException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (FamilyForbiddenException ex)
        {
            return ApiControllerHelper.MapFamilyException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to remove member {MemberUserId} from family {FamilyId} by user {UserId}.",
                memberUserId,
                familyId,
                userId);
            return ApiControllerHelper.MapFamilyException(ex);
        }
    }
}
