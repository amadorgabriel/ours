using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;

namespace ProjectOurs.Application.Auth;

public sealed class AuthService(
    IUserRepository users,
    IGoogleIdTokenValidator googleIdTokenValidator)
{
    public async Task<AuthSessionResponse> LoginWithGoogleAsync(
        string idToken,
        CancellationToken cancellationToken = default)
    {
        var payload = await googleIdTokenValidator.ValidateAsync(idToken, cancellationToken);
        var existing = await users.GetByEmailWithMembershipsAsync(payload.Email, cancellationToken);
        var isNewUser = existing is null;
        User user;

        if (isNewUser)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = payload.Email,
                Name = payload.Name,
                Picture = payload.Picture,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            await users.AddAsync(user, cancellationToken);
        }
        else
        {
            user = existing!;
            await users.UpdateProfileAsync(user.Id, payload.Name, payload.Picture, cancellationToken);
        }

        var withMemberships = await users.GetByIdWithMembershipsAsync(user.Id, cancellationToken)
            ?? user;

        return BuildSession(withMemberships, isNewUser);
    }

    public AuthSessionResponse BuildSession(User user, bool isNewUser)
    {
        var families = user.Memberships
            .Select(m => new FamilyMembershipDto(
                m.FamilyId.ToString(),
                m.Family.Name,
                m.Role == FamilyRole.Admin ? "Admin" : "Member",
                m.Family.CreatedAt))
            .ToList();

        return new AuthSessionResponse(
            new AuthUserDto(
                user.Id.ToString(),
                user.Email,
                user.Name,
                user.Picture),
            families,
            isNewUser,
            families.Count);
    }
}
