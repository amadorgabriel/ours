namespace ProjectOurs.Infrastructure.Options;

public sealed class R2Options
{
    public const string SectionName = "R2";

    public string BucketName { get; set; } = string.Empty;
    public string AccountId { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string PublicBaseUrl { get; set; } = string.Empty;

    /// <summary>Indicates whether all five required R2 settings contain non-whitespace values.</summary>
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(BucketName)
        && !string.IsNullOrWhiteSpace(AccountId)
        && !string.IsNullOrWhiteSpace(AccessKeyId)
        && !string.IsNullOrWhiteSpace(SecretAccessKey)
        && !string.IsNullOrWhiteSpace(PublicBaseUrl);
}
