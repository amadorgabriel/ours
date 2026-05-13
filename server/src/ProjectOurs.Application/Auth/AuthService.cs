using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Auth;

public sealed class AuthService(
    IGoogleIdTokenValidator googleValidator,
    IUserRepository users,
    IJwtTokenIssuer jwt) : IAuthService
{
    public async Task<AuthLoginResult> SignInWithGoogleAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            throw new GoogleTokenInvalidException("idToken is required.");
        }

        var payload = await googleValidator.ValidateAsync(idToken, cancellationToken);
        if (!payload.EmailVerified)
        {
            throw new EmailNotVerifiedException();
        }

        var email = payload.Email.Trim().ToLowerInvariant();
        var name = string.IsNullOrWhiteSpace(payload.Name) ? email : payload.Name.Trim();
        var picture = string.IsNullOrWhiteSpace(payload.Picture) ? null : payload.Picture.Trim();

        var existing = await users.GetByEmailWithMembershipsAsync(email, cancellationToken);
        bool isNew;
        User user;
        if (existing is null)
        {
            isNew = true;
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                Name = name,
                Picture = picture,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            await users.AddAsync(user, cancellationToken);
            user = (await users.GetByEmailWithMembershipsAsync(email, cancellationToken))!;
        }
        else
        {
            isNew = false;
            await users.UpdateProfileAsync(existing.Id, name, picture, cancellationToken);
            user = (await users.GetByEmailWithMembershipsAsync(email, cancellationToken))!;
        }

        var families = user.Memberships
            .OrderBy(m => m.Family.Name)
            .Select(m => new UserFamilyDto(m.FamilyId, m.Family.Name, m.Role.ToString()))
            .ToList();

        var dto = new UserDto(user.Id, user.Email, user.Name, user.Picture, families);
        var response = new AuthResponse(dto, isNew, families.Count);
        var token = jwt.CreateAccessToken(user);
        return new AuthLoginResult(response, token);
    }
}
