using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.API.Filters;
using ProjectOurs.Application.Abstractions;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Auth;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
public sealed class MeController(
    ICurrentUser currentUser,
    IFamilyMembershipRepository memberships) : ControllerBase
{
    [HttpGet("active-family")]
    [TypeFilter(typeof(RequireFamilyFilter))]
    [ProducesResponseType(typeof(ActiveFamilyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ActiveFamilyResponse>> GetActiveFamily(CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        if (HttpContext.Items["FamilyId"] is not Guid familyId)
        {
            return BadRequest();
        }

        var membership = await memberships.GetMembershipWithFamilyAsync(userId.Value, familyId, cancellationToken);
        if (membership is null)
        {
            return StatusCode(StatusCodes.Status403Forbidden);
        }

        return Ok(new ActiveFamilyResponse(membership.FamilyId, membership.Family.Name, membership.Role.ToString()));
    }
}
