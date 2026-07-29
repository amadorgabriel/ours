using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectOurs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityViewAndParentPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoData",
                table: "parents",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "activity_views",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SeenAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_views", x => x.Id);
                    table.ForeignKey(
                        name: "FK_activity_views_activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_activity_views_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activity_views_ActivityId_UserId",
                table: "activity_views",
                columns: new[] { "ActivityId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_activity_views_UserId",
                table: "activity_views",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_views");

            migrationBuilder.DropColumn(
                name: "PhotoData",
                table: "parents");
        }
    }
}
