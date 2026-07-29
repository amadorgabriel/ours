using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class DeviceRepository(ApplicationDbContext db) : IDeviceRepository
{
    public async Task<Device?> GetByUserAndPlatformAsync(
        Guid userId,
        string platform,
        CancellationToken cancellationToken = default) =>
        await db.Devices
            .FirstOrDefaultAsync(
                x => x.UserId == userId && x.Platform == platform,
                cancellationToken);

    public async Task<Device> UpsertAsync(Device device, CancellationToken cancellationToken = default)
    {
        var tracked = await db.Devices.FirstOrDefaultAsync(
            x => x.UserId == device.UserId && x.Platform == device.Platform,
            cancellationToken);

        if (tracked is null)
        {
            db.Devices.Add(device);
        }
        else
        {
            tracked.PushToken = device.PushToken;
            tracked.UpdatedAt = device.UpdatedAt;
            device = tracked;
        }

        await db.SaveChangesAsync(cancellationToken);

        return await db.Devices
            .AsNoTracking()
            .FirstAsync(x => x.Id == device.Id, cancellationToken);
    }
}
