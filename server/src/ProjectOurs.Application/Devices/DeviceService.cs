using ProjectOurs.Application.Abstractions.Persistence;
using DeviceEntity = ProjectOurs.Domain.Entities.Device;

namespace ProjectOurs.Application.Devices;

public sealed class DeviceService(IDeviceRepository devices)
{
    public async Task<DeviceDto> RegisterAsync(
        Guid userId,
        RegisterDeviceRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!DeviceRules.IsValidPushToken(request.PushToken))
        {
            throw new DeviceValidationException(
                $"Push token is required and must be at most {DeviceRules.MaxPushTokenLength} characters.");
        }

        if (!DeviceRules.IsValidPlatform(request.Platform))
        {
            throw new DeviceValidationException("Platform must be 'ios' or 'android'.");
        }

        var platform = DeviceRules.NormalizePlatform(request.Platform);
        var pushToken = request.PushToken.Trim();
        var now = DateTimeOffset.UtcNow;
        var existing = await devices.GetByUserAndPlatformAsync(userId, platform, cancellationToken);

        var device = existing ?? new DeviceEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Platform = platform,
        };

        device.PushToken = pushToken;
        device.UpdatedAt = now;

        var saved = await devices.UpsertAsync(device, cancellationToken);
        return MapToDto(saved);
    }

    internal static DeviceDto MapToDto(DeviceEntity device) =>
        new(
            device.Id.ToString(),
            device.PushToken,
            device.Platform,
            device.UpdatedAt);
}
