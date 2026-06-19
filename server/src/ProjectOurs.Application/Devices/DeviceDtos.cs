namespace ProjectOurs.Application.Devices;

public sealed record RegisterDeviceRequest(string PushToken, string Platform);

public sealed record DeviceDto(
    string Id,
    string PushToken,
    string Platform,
    DateTimeOffset UpdatedAt);
