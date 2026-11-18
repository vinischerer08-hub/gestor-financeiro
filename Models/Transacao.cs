namespace GestorFinanceiro.Models;
public class Transacao {
    public int Id { get; set; }
    public string Descricao { get; set; } = "";
    public string Tipo { get; set; } = "";
    public string Categoria { get; set; } = "";
    public decimal Valor { get; set; }
    public DateOnly Data { get; set; }
}
public record TransacaoInput(string? Descricao, string? Tipo, string? Categoria, decimal Valor, DateOnly Data);

