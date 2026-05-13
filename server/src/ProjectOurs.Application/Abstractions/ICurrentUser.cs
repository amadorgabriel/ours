namespace ProjectOurs.Application.Abstractions;

public interface ICurrentUser
{
    Guid? UserId { get; }
}
