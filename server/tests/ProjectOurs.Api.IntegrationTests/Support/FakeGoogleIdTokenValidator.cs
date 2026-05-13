using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Application.Auth;

namespace ProjectOurs.Api.IntegrationTests.Support;

public sealed class FakeGoogleIdTokenValidator : IGoogleIdTokenValidator
{
    public Task<GoogleTokenPayload> ValidateAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (idToken == "invalid")
        {
            throw new GoogleTokenInvalidException("bad token");
        }

        if (idToken == "unverified")
        {
            return Task.FromResult(new GoogleTokenPayload("unverified@example.com", false, "U", null));
        }

        return Task.FromResult(
            new GoogleTokenPayload(
                "integration-tester@example.com",
                true,
                "Integration Tester",
                "https://example.com/avatar.png"));
    }
}
