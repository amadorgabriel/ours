namespace ProjectOurs.Application.Family;

public interface IInviteEmailSender
{
    Task SendAsync(string? invitedEmail, string inviteCode, CancellationToken cancellationToken = default);
}

public sealed class InviteDeliveryException : Exception
{
    public InviteDeliveryException(string message) : base(message)
    {
    }
}
