using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Common;

namespace ProjectOurs.API.Filters;

public sealed class RequireFamilyFilter(IFamilyMembershipRepository memberships) : IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context.Result is not null)
        {
            return;
        }

        var principal = context.HttpContext.User;
        if (principal.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!context.HttpContext.Request.Headers.TryGetValue(FamilyHeaders.FamilyId, out var raw) ||
            string.IsNullOrWhiteSpace(raw))
        {
            context.Result = new BadRequestObjectResult(new { error = "X-Family-Id header is required." });
            return;
        }

        if (!Guid.TryParse(raw.ToString(), out var familyId))
        {
            context.Result = new BadRequestObjectResult(new { error = "X-Family-Id must be a valid GUID." });
            return;
        }

        var userIdValue = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var isMember = await memberships.IsUserMemberOfFamilyAsync(
            userId,
            familyId,
            context.HttpContext.RequestAborted);

        if (!isMember)
        {
            context.Result = new ObjectResult(new { error = "User is not a member of this family." })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
            return;
        }

        context.HttpContext.Items["FamilyId"] = familyId;
    }
}
