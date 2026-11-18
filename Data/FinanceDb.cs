using Microsoft.EntityFrameworkCore;
using GestorFinanceiro.Models;
namespace GestorFinanceiro.Data;
public class FinanceDb(DbContextOptions<FinanceDb> options) : DbContext(options) {
    public DbSet<Transacao> Transacoes => Set<Transacao>();
}

