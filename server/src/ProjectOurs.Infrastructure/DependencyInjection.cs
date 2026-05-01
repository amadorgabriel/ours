using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.Infrastructure.Data;

namespace ProjectOurs.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure DbContext with PostgreSQL
        services.AddDbContext<ProjectOursDbContext>(options =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly("ProjectOurs.Infrastructure");
                    npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
                });
        });

        return services;
    }
}
