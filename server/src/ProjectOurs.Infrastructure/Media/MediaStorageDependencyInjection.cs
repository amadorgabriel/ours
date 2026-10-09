using Amazon.S3;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Infrastructure.Options;

namespace ProjectOurs.Infrastructure.Media;

internal static class MediaStorageDependencyInjection
{
    /// <summary>
    /// Registers R2 storage when all required settings are present, otherwise selecting inline base64 storage.
    /// </summary>
    public static IServiceCollection AddMediaStorage(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<R2Options>(configuration.GetSection(R2Options.SectionName));
        var r2 = configuration.GetSection(R2Options.SectionName).Get<R2Options>();

        if (r2 is { IsConfigured: true })
        {
            services.AddSingleton<IAmazonS3>(_ =>
            {
                var config = new AmazonS3Config
                {
                    ServiceURL = $"https://{r2.AccountId}.r2.cloudflarestorage.com",
                    AuthenticationRegion = "auto",
                    ForcePathStyle = true,
                };

                return new AmazonS3Client(r2.AccessKeyId, r2.SecretAccessKey, config);
            });
            services.AddScoped<IMediaStorage, R2MediaStorage>();
        }
        else
        {
            services.AddScoped<IMediaStorage, InlineBase64MediaStorage>();
        }

        return services;
    }
}
