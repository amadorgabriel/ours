using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectOurs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGoalParentId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                table: "goals",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_goals_ParentId",
                table: "goals",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_goals_parents_ParentId",
                table: "goals",
                column: "ParentId",
                principalTable: "parents",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_goals_parents_ParentId",
                table: "goals");

            migrationBuilder.DropIndex(
                name: "IX_goals_ParentId",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "goals");
        }
    }
}
