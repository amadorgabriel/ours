using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.Activity;
using ProjectOurs.Application.Common;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/activities")]
[Authorize]
public sealed class ActivitiesController(
    ActivityService activityService,
    ILogger<ActivitiesController> logger) : ControllerBase
{
    [HttpGet("feed")]
    [ProducesResponseType(typeof(ActivityFeedResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetFeed(
        [FromQuery] int? limit,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] string? parentId,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        if (!TryGetFamilyId(out var familyId, out var familyError))
        {
            return familyError!;
        }

        try
        {
            var feed = await activityService.GetFeedAsync(
                userId,
                familyId,
                limit,
                from,
                to,
                parentId,
                cancellationToken);
            return Ok(feed);
        }
        catch (ActivityValidationException ex)
        {
            return MapActivityException(ex);
        }
        catch (ActivityForbiddenException ex)
        {
            return MapActivityException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to load activity feed for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapActivityException(ex);
        }
    }

    [HttpPost("call")]
    [ProducesResponseType(typeof(ActivityFeedItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RegisterCall(
        [FromBody] RegisterCallRequest request,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        if (!TryGetFamilyId(out var familyId, out var familyError))
        {
            return familyError!;
        }

        try
        {
            var activity = await activityService.RegisterCallAsync(
                userId,
                familyId,
                request,
                cancellationToken);
            return Ok(activity);
        }
        catch (ActivityValidationException ex)
        {
            return MapActivityException(ex);
        }
        catch (ActivityForbiddenException ex)
        {
            return MapActivityException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to register call for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapActivityException(ex);
        }
    }

    [HttpPost("visit")]
    [ProducesResponseType(typeof(ActivityFeedItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RegisterVisit(
        [FromBody] RegisterVisitRequest request,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        if (!TryGetFamilyId(out var familyId, out var familyError))
        {
            return familyError!;
        }

        try
        {
            var activity = await activityService.RegisterVisitAsync(
                userId,
                familyId,
                request,
                cancellationToken);
            return Ok(activity);
        }
        catch (ActivityValidationException ex)
        {
            return MapActivityException(ex);
        }
        catch (ActivityForbiddenException ex)
        {
            return MapActivityException(ex);
        }
        catch (InvalidOperationException ex)
        {
            return new BadRequestObjectResult(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to register visit for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapActivityException(ex);
        }
    }

    [HttpPost("{activityId:guid}/seen")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkSeen(
        Guid activityId,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        if (!TryGetFamilyId(out var familyId, out var familyError))
        {
            return familyError!;
        }

        try
        {
            await activityService.MarkSeenAsync(userId, familyId, activityId, cancellationToken);
            return NoContent();
        }
        catch (ActivityNotFoundException ex)
        {
            return new NotFoundObjectResult(new { message = ex.Message });
        }
        catch (ActivityValidationException ex)
        {
            return MapActivityException(ex);
        }
        catch (ActivityForbiddenException ex)
        {
            return MapActivityException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to mark activity {ActivityId} seen for user {UserId} in family {FamilyId}.",
                activityId,
                userId,
                familyId);
            return MapActivityException(ex);
        }
    }

    private bool TryGetFamilyId(out Guid familyId, out IActionResult? error)
    {
        if (!Request.Headers.TryGetValue(FamilyHeaders.FamilyId, out var familyIdHeader)
            || !Guid.TryParse(familyIdHeader.FirstOrDefault(), out familyId))
        {
            familyId = default;
            error = BadRequest(new { message = "Active family not specified." });
            return false;
        }

        error = null;
        return true;
    }

    private static IActionResult MapActivityException(Exception exception) =>
        exception switch
        {
            ActivityValidationException ex => new BadRequestObjectResult(new { message = ex.Message }),
            ActivityForbiddenException ex => new ObjectResult(new { message = ex.Message })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            },
            _ => new ObjectResult(new { message = "An unexpected error occurred." })
            {
                StatusCode = StatusCodes.Status500InternalServerError,
            },
        };
}
