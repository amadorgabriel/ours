using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.DTOs;
using ProjectOurs.Application.Interfaces;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("google")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        // This endpoint will be fully implemented in the auth module
        // For now, returning 501 Not Implemented
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "Authentication logic to be implemented" });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public IActionResult Refresh()
    {
        // To be implemented in the future
        return StatusCode(StatusCodes.Status501NotImplemented, new { message = "Token refresh not implemented yet" });
    }
}
