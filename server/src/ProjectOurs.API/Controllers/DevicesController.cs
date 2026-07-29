using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectOurs.Application.Devices;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("api/devices")]
[Authorize]
public sealed class DevicesController(
    DeviceService deviceService,
    ILogger<DevicesController> logger) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(DeviceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterDeviceRequest request,
        CancellationToken cancellationToken)
    {
        if (!ApiControllerHelper.TryGetUserId(User, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var device = await deviceService.RegisterAsync(userId, request, cancellationToken);
            return Ok(device);
        }
        catch (DeviceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to register device for user {UserId}.", userId);
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { message = "An unexpected error occurred." });
        }
    }
}
