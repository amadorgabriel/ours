using Microsoft.EntityFrameworkCore;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Infrastructure.Persistence;

public sealed class UserRepository(ApplicationDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<User?> GetByEmailWithMembershipsAsync(string email, CancellationToken cancellationToken = default) =>
        db.Users.AsNoTracking()
            .Include(u => u.Memberships)
            .ThenInclude(m => m.Family)
            .AsSplitQuery()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task UpdateProfileAsync(Guid userId, string name, string? picture, CancellationToken cancellationToken = default)
    {
        await db.Users
            .Where(u => u.Id == userId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.Name, name)
                    .SetProperty(u => u.Picture, picture),
                cancellationToken);
    }
}
