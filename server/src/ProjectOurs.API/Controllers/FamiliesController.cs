using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.DTOs;
using ProjectOurs.Application.Interfaces;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly IFamilyService _familyService;

    public FamiliesController(IFamilyService familyService)
    {
        _familyService = familyService;
    }

    [HttpPost]
    public async Task<ActionResult<FamilyDto>> CreateFamily([FromBody] CreateFamilyRequest request, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet("my-family")]
    public async Task<ActionResult<FamilyDto>> GetMyFamily(CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPost("invite")]
    public async Task<ActionResult<FamilyInviteDto>> GenerateInvite(CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPost("join")]
    [AllowAnonymous]
    public async Task<ActionResult<JoinFamilyResponse>> JoinFamily([FromBody] JoinFamilyRequest request, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpGet("pending-approvals")]
    public async Task<ActionResult<List<PendingApprovalDto>>> GetPendingApprovals(CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPost("approve/{userId:guid}")]
    public async Task<IActionResult> ApproveMember(Guid userId, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPost("reject/{userId:guid}")]
    public async Task<IActionResult> RejectMember(Guid userId, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }

    [HttpPut("parents/{parentId:guid}")]
    public async Task<ActionResult<ParentDto>> UpdateParent(Guid parentId, [FromBody] UpdateParentRequest request, CancellationToken cancellationToken)
    {
        // To be implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "To be implemented" });
    }
}
