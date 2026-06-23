namespace ProjectOurs.Application.Common;

public static class Base64ImageHelper
{
    public const int MaxDecodedBytes = 512 * 1024;

    /// <summary>Maximum base64 payload length for <see cref="MaxDecodedBytes"/> (no whitespace).</summary>
    public const int MaxPayloadLength = ((MaxDecodedBytes + 2) / 3) * 4;

    public static string ExtractPayload(string input)
    {
        var commaIndex = input.IndexOf(',');
        return commaIndex >= 0 ? input[(commaIndex + 1)..] : input;
    }

    public static byte[] Decode(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            throw new FormatException("Empty image data.");
        }

        var payload = ExtractPayload(input);
        if (payload.Length > MaxPayloadLength)
        {
            throw new InvalidOperationException(
                $"Image exceeds maximum size of {MaxDecodedBytes / 1024}KB.");
        }

        byte[] bytes;
        try
        {
            bytes = Convert.FromBase64String(payload);
        }
        catch (FormatException)
        {
            throw new FormatException("Invalid base64 image data.");
        }

        if (bytes.Length > MaxDecodedBytes)
        {
            throw new InvalidOperationException(
                $"Image exceeds maximum size of {MaxDecodedBytes / 1024}KB.");
        }

        return bytes;
    }
}
