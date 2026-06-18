using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.Common;
using ProjectOurs.Application.Goals;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/goals")]
[Authorize]
public sealed class GoalsController(
    GoalService goalService,
    ILogger<GoalsController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GoalListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
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
            var response = await goalService.ListAsync(userId, familyId, cancellationToken);
            return Ok(response);
        }
        catch (GoalValidationException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalForbiddenException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to list goals for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapGoalException(ex);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(GoalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateGoalRequest request,
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
            var goal = await goalService.CreateAsync(userId, familyId, request, cancellationToken);
            return Ok(goal);
        }
        catch (GoalValidationException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalForbiddenException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create goal for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapGoalException(ex);
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

    private static IActionResult MapGoalException(Exception exception) =>
        exception switch
        {
            GoalValidationException ex => new BadRequestObjectResult(new { message = ex.Message }),
            GoalForbiddenException ex => new ObjectResult(new { message = ex.Message })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            },
            _ => new ObjectResult(new { message = "An unexpected error occurred." })
            {
                StatusCode = StatusCodes.Status500InternalServerError,
            },
        };
}
