namespace ProjectOurs.Application.Auth;

public sealed class GoogleTokenInvalidException : Exception
{
    public GoogleTokenInvalidException(string? message = null, Exception? inner = null)
        : base(message ?? "Invalid or expired Google ID token.", inner)
    {
    }
}

public sealed class EmailNotVerifiedException : Exception
{
    public EmailNotVerifiedException()
        : base("Google account email is not verified.")
    {
    }
}
