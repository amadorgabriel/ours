using ProjectOurs.Domain.Entities;

namespace ProjectOurs.Application.Abstractions.Auth;

public interface IJwtTokenIssuer
{
    string CreateAccessToken(User user);
}
