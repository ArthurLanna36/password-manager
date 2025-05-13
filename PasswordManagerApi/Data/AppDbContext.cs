using Microsoft.EntityFrameworkCore;
using PasswordManagerApi.Models;

namespace PasswordManagerApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts)
            : base(opts)
        { }

        public DbSet<UserProfile> Profiles { get; set; } = null!;
    }
}
