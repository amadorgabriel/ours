using Microsoft.AspNetCore.Mvc;

namespace ProjectOurs.API.Controllers;

[ApiController]
[Route("health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public IActionResult Get() =>
        Ok(new HealthResponse("ok", DateTimeOffset.UtcNow));
}

public sealed record HealthResponse(string Status, DateTimeOffset Timestamp);
