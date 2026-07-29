namespace ProjectOurs.Application.Abstractions.Auth;

public interface IJwtTokenFactory
{
    string CreateToken(Guid userId, string email, string name);
}
