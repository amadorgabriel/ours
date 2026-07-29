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
    GoalContributionService goalContributionService,
    ILogger<GoalsController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GoalListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> List(
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

        Guid? parsedParentId = null;
        if (!string.IsNullOrWhiteSpace(parentId))
        {
            if (!Guid.TryParse(parentId, out var resolvedParentId))
            {
                return BadRequest(new { message = "Invalid assistido filter." });
            }

            parsedParentId = resolvedParentId;
        }

        try
        {
            var response = await goalService.ListAsync(
                userId,
                familyId,
                parsedParentId,
                cancellationToken);
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

    [HttpGet("{goalId:guid}/contributions")]
    [ProducesResponseType(typeof(GoalContributionListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ListContributions(
        Guid goalId,
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
            var response = await goalContributionService.ListAsync(
                userId,
                familyId,
                goalId,
                cancellationToken);
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
        catch (GoalNotFoundException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to list contributions for goal {GoalId}, user {UserId}, family {FamilyId}.",
                goalId,
                userId,
                familyId);
            return MapGoalException(ex);
        }
    }

    [HttpPost("{goalId:guid}/contributions")]
    [ProducesResponseType(typeof(GoalContributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateContribution(
        Guid goalId,
        [FromBody] CreateGoalContributionRequest request,
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
            var contribution = await goalContributionService.CreateAsync(
                userId,
                familyId,
                goalId,
                request,
                cancellationToken);
            return Ok(contribution);
        }
        catch (GoalValidationException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalForbiddenException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalNotFoundException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to create contribution for goal {GoalId}, user {UserId}, family {FamilyId}.",
                goalId,
                userId,
                familyId);
            return MapGoalException(ex);
        }
    }

    [HttpPatch("{goalId:guid}/contributions/{contributionId:guid}")]
    [ProducesResponseType(typeof(GoalContributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateContribution(
        Guid goalId,
        Guid contributionId,
        [FromBody] UpdateGoalContributionRequest request,
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
            var contribution = await goalContributionService.UpdateAsync(
                userId,
                familyId,
                goalId,
                contributionId,
                request,
                cancellationToken);
            return Ok(contribution);
        }
        catch (GoalValidationException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalForbiddenException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalNotFoundException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to update contribution {ContributionId} for goal {GoalId}, user {UserId}.",
                contributionId,
                goalId,
                userId);
            return MapGoalException(ex);
        }
    }

    [HttpDelete("{goalId:guid}/contributions/{contributionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteContribution(
        Guid goalId,
        Guid contributionId,
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
            await goalContributionService.DeleteAsync(
                userId,
                familyId,
                goalId,
                contributionId,
                cancellationToken);
            return NoContent();
        }
        catch (GoalForbiddenException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalNotFoundException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to delete contribution {ContributionId} for goal {GoalId}, user {UserId}.",
                contributionId,
                goalId,
                userId);
            return MapGoalException(ex);
        }
    }

    [HttpDelete("{goalId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid goalId,
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
            await goalService.DeleteAsync(userId, familyId, goalId, cancellationToken);
            return NoContent();
        }
        catch (GoalValidationException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalForbiddenException ex)
        {
            return MapGoalException(ex);
        }
        catch (GoalNotFoundException ex)
        {
            return MapGoalException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to delete goal {GoalId} for user {UserId} in family {FamilyId}.",
                goalId,
                userId,
                familyId);
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
            GoalNotFoundException ex => new NotFoundObjectResult(new { message = ex.Message }),
            _ => new ObjectResult(new { message = "An unexpected error occurred." })
            {
                StatusCode = StatusCodes.Status500InternalServerError,
            },
        };
}
