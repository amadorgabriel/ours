using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.DTOs;
using ProjectOurs.Application.Interfaces;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goalService;

    public GoalsController(IGoalService goalService)
    {
        _goalService = goalService;
    }

    [HttpPost]
    public async Task<ActionResult<GoalDto>> CreateGoal([FromBody] CreateGoalRequest request, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet]
    public async Task<ActionResult<List<GoalDto>>> GetGoals(CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet("{goalId:guid}")]
    public async Task<ActionResult<GoalDetailDto>> GetGoal(Guid goalId, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPost("{goalId:guid}/contribute")]
    public async Task<ActionResult<ContributeResponse>> Contribute(Guid goalId, [FromBody] ContributeRequest request, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet("my-contributions")]
    public async Task<ActionResult<MyContributionsResponse>> GetMyContributions(CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPost("{goalId:guid}/cancel")]
    public async Task<IActionResult> CancelGoal(Guid goalId, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }
}
