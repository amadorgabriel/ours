using ProjectOurs.Application.Abstractions.Media;

namespace ProjectOurs.Application.Common;

public static class MediaStorageExtensions
{
    /// <summary>
    /// Best-effort delete after the database already reflects removal or replacement.
    /// </summary>
    public static async Task TryDeleteByReferenceAsync(
        this IMediaStorage storage,
        string? storedReference,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storedReference))
        {
            return;
        }

        try
        {
            await storage.DeleteByReferenceAsync(storedReference, cancellationToken);
        }
        catch
        {
            // Orphaned objects can be reconciled manually; DB state is already committed.
        }
    }
}
