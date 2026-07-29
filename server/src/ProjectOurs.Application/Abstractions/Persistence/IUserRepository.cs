using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Persistence;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailWithMembershipsAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdWithMembershipsAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    Task UpdateProfileAsync(
        Guid id,
        string name,
        string? picture,
        CancellationToken cancellationToken = default);
}
