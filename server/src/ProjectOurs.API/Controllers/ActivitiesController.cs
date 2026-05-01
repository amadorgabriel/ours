using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.DTOs;
using ProjectOurs.Application.Interfaces;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpPost("call")]
    public async Task<ActionResult<ActivityDto>> CreateCallActivity([FromBody] CreateCallActivityRequest request, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet("feed")]
    public async Task<ActionResult<ActivityFeedResponse>> GetFeed(CancellationToken cancellationToken, [FromQuery] int limit = 20, [FromQuery] int offset = 0)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet("my-stats")]
    public async Task<ActionResult<UserStatsDto>> GetMyStats(CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }
}
