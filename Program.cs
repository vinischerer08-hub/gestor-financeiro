using Microsoft.EntityFrameworkCore;
using GestorFinanceiro.Data;
using GestorFinanceiro.Models;

var builder = WebApplication.CreateBuilder(args);
var dataDirectory = Path.Combine(builder.Environment.ContentRootPath, "App_Data");
Directory.CreateDirectory(dataDirectory);
builder.Services.AddDbContext<FinanceDb>(options =>
    options.UseSqlite($"Data Source={Path.Combine(dataDirectory, "financas.db")}"));
var app = builder.Build();
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<FinanceDb>().Database.EnsureCreated();

app.UseDefaultFiles();
app.UseStaticFiles();

var api = app.MapGroup("/api/transacoes");
api.MapGet("/", async (FinanceDb db) => await db.Transacoes
    .OrderByDescending(t => t.Data).ThenByDescending(t => t.Id).ToListAsync());
api.MapPost("/", async (TransacaoInput input, FinanceDb db) => {
    var errors = Validar(input);
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var item = new Transacao(); Aplicar(item, input);
    db.Transacoes.Add(item); await db.SaveChangesAsync();
    return Results.Created($"/api/transacoes/{item.Id}", item);
});
api.MapPut("/{id:int}", async (int id, TransacaoInput input, FinanceDb db) => {
    var errors = Validar(input);
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var item = await db.Transacoes.FindAsync(id);
    if (item is null) return Results.NotFound();
    Aplicar(item, input); await db.SaveChangesAsync();
    return Results.Ok(item);
});
api.MapDelete("/{id:int}", async (int id, FinanceDb db) => {
    var item = await db.Transacoes.FindAsync(id);
    if (item is null) return Results.NotFound();
    db.Transacoes.Remove(item); await db.SaveChangesAsync();
    return Results.NoContent();
});
app.Run();

static Dictionary<string, string[]> Validar(TransacaoInput i) {
    var e = new Dictionary<string, string[]>();
    if (string.IsNullOrWhiteSpace(i.Descricao) || i.Descricao.Trim().Length > 100) e["descricao"] = ["Informe uma descrição de até 100 caracteres."];
    if (i.Tipo is not ("receita" or "despesa")) e["tipo"] = ["Selecione receita ou despesa."];
    if (string.IsNullOrWhiteSpace(i.Categoria) || i.Categoria.Trim().Length > 50) e["categoria"] = ["Informe uma categoria de até 50 caracteres."];
    if (i.Valor <= 0 || i.Valor > 100000000 || decimal.Round(i.Valor, 2) != i.Valor) e["valor"] = ["Informe um valor positivo com até duas casas decimais."];
    if (i.Data == default) e["data"] = ["Informe uma data válida."];
    return e;
}
static void Aplicar(Transacao t, TransacaoInput i) {
    t.Descricao = i.Descricao!.Trim(); t.Tipo = i.Tipo!; t.Categoria = i.Categoria!.Trim();
    t.Valor = i.Valor; t.Data = i.Data;
}
public partial class Program { }

