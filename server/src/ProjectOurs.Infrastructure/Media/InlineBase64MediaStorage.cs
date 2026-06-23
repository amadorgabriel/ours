using ProjectOurs.Application.Abstractions.Media;

namespace ProjectOurs.Infrastructure.Media;

public sealed class InlineBase64MediaStorage : IMediaStorage
{
    public const int MaxBytes = 512 * 1024;

    private static readonly HashSet<string> AllowedMimeTypes =
    [
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];

    public async Task<string> StoreAsync(
        Stream content,
        string mimeType,
        CancellationToken cancellationToken = default)
    {
        if (!AllowedMimeTypes.Contains(mimeType.ToLowerInvariant()))
        {
            throw new InvalidOperationException("Only JPEG and PNG images are allowed.");
        }

        using var memory = new MemoryStream();
        await content.CopyToAsync(memory, cancellationToken);
        var bytes = memory.ToArray();

        if (bytes.Length > MaxBytes)
        {
            throw new InvalidOperationException($"Image exceeds maximum size of {MaxBytes / 1024}KB.");
        }

        var normalizedMime = mimeType.Equals("image/jpg", StringComparison.OrdinalIgnoreCase)
            ? "image/jpeg"
            : mimeType.ToLowerInvariant();

        return $"data:{normalizedMime};base64,{Convert.ToBase64String(bytes)}";
    }
}
