using System;
using Microsoft.AspNetCore.Mvc;
using Supabase;                              // Supabase SDK
using Supabase.Postgrest.Exceptions;         // <- aqui
using PasswordManagerApi.Models.Dto;

namespace PasswordManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Client _supabase;

        public AuthController(Client supabase)
            => _supabase = supabase ?? throw new ArgumentNullException(nameof(supabase));

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { error = "Email e senha são obrigatórios" });
            }

            try
            {
                var session = await _supabase.Auth.SignUp(dto.Email, dto.Password)
                                  ?? throw new Exception("Falha ao criar conta.");

                var user = session.User
                           ?? throw new Exception("Conta criada, mas não foi possível obter dados do usuário.");

                return Ok(new
                {
                    AccessToken  = session.AccessToken,
                    RefreshToken = session.RefreshToken,
                    UserId       = user.Id
                });
            }
            catch (PostgrestException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn([FromBody] SignInDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { error = "Email e senha são obrigatórios" });
            }

            try
            {
                var session = await _supabase.Auth.SignIn(dto.Email, dto.Password)
                                  ?? throw new Exception("Credenciais inválidas.");

                var user = session.User
                           ?? throw new Exception("Login bem-sucedido, mas não foi possível obter dados do usuário.");

                return Ok(new
                {
                    AccessToken  = session.AccessToken,
                    RefreshToken = session.RefreshToken,
                    UserId       = user.Id
                });
            }
            catch (PostgrestException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }
    }
}
