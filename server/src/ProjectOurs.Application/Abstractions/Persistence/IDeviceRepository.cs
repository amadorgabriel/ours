using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IDeviceRepository
{
    Task<Device?> GetByUserAndPlatformAsync(
        Guid userId,
        string platform,
        CancellationToken cancellationToken = default);

    Task<Device> UpsertAsync(Device device, CancellationToken cancellationToken = default);
}
