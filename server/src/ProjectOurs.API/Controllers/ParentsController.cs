using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.Common;
using ProjectOurs.Application.Parents;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/parents")]
[Authorize]
public sealed class ParentsController(
    ParentService parentService,
    ILogger<ParentsController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ParentListResponse), StatusCodes.Status200OK)]
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
            var response = await parentService.ListAsync(userId, familyId, cancellationToken);
            return Ok(response);
        }
        catch (ParentValidationException ex)
        {
            return MapParentException(ex);
        }
        catch (ParentForbiddenException ex)
        {
            return MapParentException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to list parents for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapParentException(ex);
        }
    }

    [HttpGet("{parentId:guid}")]
    [ProducesResponseType(typeof(ParentDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(
        Guid parentId,
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
            var parent = await parentService.GetAsync(userId, familyId, parentId, cancellationToken);
            return Ok(parent);
        }
        catch (ParentValidationException ex)
        {
            return MapParentException(ex);
        }
        catch (ParentForbiddenException ex)
        {
            return MapParentException(ex);
        }
        catch (ParentNotFoundException ex)
        {
            return MapParentException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to get parent {ParentId} for user {UserId} in family {FamilyId}.",
                parentId,
                userId,
                familyId);
            return MapParentException(ex);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(ParentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateParentRequest request,
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
            var parent = await parentService.CreateAsync(userId, familyId, request, cancellationToken);
            return Ok(parent);
        }
        catch (ParentValidationException ex)
        {
            return MapParentException(ex);
        }
        catch (ParentForbiddenException ex)
        {
            return MapParentException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create parent for user {UserId} in family {FamilyId}.", userId, familyId);
            return MapParentException(ex);
        }
    }

    [HttpPut("{parentId:guid}")]
    [ProducesResponseType(typeof(ParentDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid parentId,
        [FromBody] UpdateParentRequest request,
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
            var parent = await parentService.UpdateAsync(
                userId,
                familyId,
                parentId,
                request,
                cancellationToken);
            return Ok(parent);
        }
        catch (ParentValidationException ex)
        {
            return MapParentException(ex);
        }
        catch (ParentForbiddenException ex)
        {
            return MapParentException(ex);
        }
        catch (ParentNotFoundException ex)
        {
            return MapParentException(ex);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to update parent {ParentId} for user {UserId} in family {FamilyId}.",
                parentId,
                userId,
                familyId);
            return MapParentException(ex);
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

    private static IActionResult MapParentException(Exception exception) =>
        exception switch
        {
            ParentValidationException ex => new BadRequestObjectResult(new { message = ex.Message }),
            ParentForbiddenException ex => new ObjectResult(new { message = ex.Message })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            },
            ParentNotFoundException ex => new NotFoundObjectResult(new { message = ex.Message }),
            _ => new ObjectResult(new { message = "An unexpected error occurred." })
            {
                StatusCode = StatusCodes.Status500InternalServerError,
            },
        };
}
