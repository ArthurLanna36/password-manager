using System;

namespace PasswordManagerApi.Models
{
    public class UserProfile
    {
        // PK = id do Auth (UUID do Supabase)
        public Guid   Id         { get; set; }
        public string Username   { get; set; } = default!;
        public string? AvatarUrl { get; set; }
    }
}
