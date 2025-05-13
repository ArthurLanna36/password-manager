namespace PasswordManagerApi.Models
{
    public class SupabaseSettings
    {
        public string Url            { get; set; } = default!;
        public string AnonKey        { get; set; } = default!;
        public string ServiceRoleKey { get; set; } = default!;
        public string JwtSecret      { get; set; } = default!;
    }
}
