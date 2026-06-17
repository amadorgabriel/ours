using System.Security.Cryptography;

namespace ProjectOurs.Application.Family;

public sealed class InviteCodeGenerator : IInviteCodeGenerator
{
    private const string Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public string Generate()
    {
        Span<byte> bytes = stackalloc byte[FamilyRules.InviteCodeLength];
        RandomNumberGenerator.Fill(bytes);

        var chars = new char[FamilyRules.InviteCodeLength];
        for (var i = 0; i < FamilyRules.InviteCodeLength; i++)
        {
            chars[i] = Charset[bytes[i] % Charset.Length];
        }

        return new string(chars);
    }
}
