using Moq;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Application.Devices;
using ProjectOurs.Domain.Entities;
using Xunit;

namespace ProjectOurs.UnitTests.Application;

public sealed class DeviceServiceTests
{
    private readonly Mock<IDeviceRepository> _devices = new();
    private readonly DeviceService _sut;

    public DeviceServiceTests()
    {
        _sut = new DeviceService(_devices.Object);
    }

    [Fact]
    public async Task RegisterAsync_WithValidRequest_ReturnsDevice()
    {
        var userId = Guid.NewGuid();
        var deviceId = Guid.NewGuid();

        _devices
            .Setup(x => x.GetByUserAndPlatformAsync(userId, "ios", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device?)null);

        _devices
            .Setup(x => x.UpsertAsync(It.IsAny<Device>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device device, CancellationToken _) => new Device
            {
                Id = deviceId,
                UserId = userId,
                PushToken = device.PushToken,
                Platform = device.Platform,
                UpdatedAt = device.UpdatedAt,
            });

        var result = await _sut.RegisterAsync(
            userId,
            new RegisterDeviceRequest("ExponentPushToken[abc]", "ios"));

        Assert.Equal(deviceId.ToString(), result.Id);
        Assert.Equal("ExponentPushToken[abc]", result.PushToken);
        Assert.Equal("ios", result.Platform);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingDevice_UpdatesToken()
    {
        var userId = Guid.NewGuid();
        var deviceId = Guid.NewGuid();
        var existing = new Device
        {
            Id = deviceId,
            UserId = userId,
            PushToken = "old-token",
            Platform = "android",
            UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        };

        _devices
            .Setup(x => x.GetByUserAndPlatformAsync(userId, "android", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        _devices
            .Setup(x => x.UpsertAsync(existing, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Device device, CancellationToken _) => device);

        var result = await _sut.RegisterAsync(
            userId,
            new RegisterDeviceRequest("  new-token  ", "Android"));

        Assert.Equal("new-token", result.PushToken);
        Assert.Equal("android", result.Platform);
    }

    [Fact]
    public async Task RegisterAsync_WithEmptyToken_ThrowsValidation()
    {
        var userId = Guid.NewGuid();

        await Assert.ThrowsAsync<DeviceValidationException>(() =>
            _sut.RegisterAsync(userId, new RegisterDeviceRequest("   ", "ios")));
    }

    [Fact]
    public async Task RegisterAsync_WithInvalidPlatform_ThrowsValidation()
    {
        var userId = Guid.NewGuid();

        await Assert.ThrowsAsync<DeviceValidationException>(() =>
            _sut.RegisterAsync(userId, new RegisterDeviceRequest("token", "web")));
    }
}
