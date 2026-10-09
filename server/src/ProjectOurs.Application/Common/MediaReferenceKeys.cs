using System.Text.RegularExpressions;

namespace ProjectOurs.Application.Common;

public static partial class MediaReferenceKeys
{
    [GeneratedRegex(
        @"^families/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/(?:parents|activities)/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.(?:jpg|png)$",
        RegexOptions.CultureInvariant | RegexOptions.Singleline)]
    private static partial Regex ObjectKeyPattern();

    public static bool TryGetObjectKey(string? storedReference, out string key)
    {
        key = string.Empty;
        if (string.IsNullOrWhiteSpace(storedReference)
            || storedReference.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var path = storedReference.Contains("://", StringComparison.Ordinal)
            ? ExtractAbsolutePath(storedReference)
            : storedReference.TrimStart('/');

        if (string.IsNullOrWhiteSpace(path) || !ObjectKeyPattern().IsMatch(path))
        {
            return false;
        }

        key = path;
        return true;
    }

    private static string? ExtractAbsolutePath(string storedReference)
    {
        if (!Uri.TryCreate(storedReference, UriKind.Absolute, out var uri))
        {
            return null;
        }

        return Uri.UnescapeDataString(uri.AbsolutePath).TrimStart('/');
    }
}
