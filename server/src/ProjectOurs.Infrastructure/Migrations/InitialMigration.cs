using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectOurs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The actual migration SQL is generated from the DbContext configuration
            // Run 'dotnet ef migrations add InitialMigration' to generate proper migration files
            // or use 'dotnet ef database update' to apply this migration directly
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert migration logic
        }
    }
}
