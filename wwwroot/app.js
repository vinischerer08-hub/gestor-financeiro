const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(value);
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let transactions = [];
let toastTimer;
function notify(message) { $('toast').textContent = message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3500); }
async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) { let message = 'Não foi possível concluir a operação.'; try { const error = await response.json(); message = Object.values(error.errors || {}).flat().join(' ') || message; } catch {} throw new Error(message); }
  return response.status === 204 ? null : response.json();
}
async function load() { try { transactions = await request('/api/transacoes'); render(); } catch { notify('Não foi possível carregar os lançamentos. Verifique se a aplicação está em execução.'); } }
function getMonth() { return transactions.filter(t => t.data.startsWith($('month').value)); }
function filtered() { const term = $('search').value.trim().toLocaleLowerCase('pt-BR'); return getMonth().filter(t => (!$('filterType').value || t.tipo === $('filterType').value) && (!term || `${t.descricao} ${t.categoria}`.toLocaleLowerCase('pt-BR').includes(term))); }
function render() {
  const month = getMonth();
  const sum = type => month.filter(t => t.tipo === type).reduce((n,t) => n + Math.round(t.valor * 100), 0) / 100;
  const income = sum('receita'), expenses = sum('despesa');
  $('receitas').textContent = money(income); $('despesas').textContent = money(expenses); $('saldo').textContent = money(income - expenses);
  const rows = filtered();
  $('transactionList').innerHTML = rows.map(t => `<tr><td>${escapeHtml(t.descricao)}</td><td>${t.data.split('-').reverse().join('/')}</td><td><span class="tag">${escapeHtml(t.categoria)}</span></td><td class="${t.tipo === 'receita' ? 'money-in':'money-out'}">${t.tipo === 'receita' ? '+':'−'} ${money(t.valor)}</td><td><button class="action" data-edit="${t.id}" aria-label="Editar ${escapeHtml(t.descricao)}">Editar</button><button class="action" data-delete="${t.id}" aria-label="Excluir ${escapeHtml(t.descricao)}">Excluir</button></td></tr>`).join('');
  $('empty').hidden = rows.length !== 0; $('count').textContent = `${rows.length} ${rows.length === 1 ? 'lançamento':'lançamentos'}`;
  const cats = new Map(); for (const t of month.filter(t => t.tipo === 'despesa')) cats.set(t.categoria, (cats.get(t.categoria) || 0) + Math.round(t.valor * 100));
  const ordered = [...cats].sort((a,b) => b[1]-a[1]);
  $('categoryEmpty').hidden = ordered.length > 0;
  $('categories').innerHTML = ordered.map(([name,cents]) => `<div class="category-row"><div class="category-line"><span>${escapeHtml(name)}</span><strong>${money(cents/100)}</strong></div><div class="track"><div style="width:${Math.min(100, cents / (expenses*100) * 100)}%"></div></div></div>`).join('');
}
function openForm(t) {
  $('transactionForm').reset(); $('formError').textContent = ''; $('transactionId').value = t?.id || '';
  $('dialogTitle').textContent = t ? 'Editar lançamento' : 'Novo lançamento';
  $('description').value = t?.descricao || ''; $('type').value = t?.tipo || 'despesa'; $('category').value = t?.categoria || '';
  $('amount').value = t?.valor || ''; $('date').value = t?.data || localDate(); $('transactionDialog').showModal();
}
$('newTransaction').addEventListener('click', () => openForm());
for (const id of ['closeDialog','cancelDialog']) $(id).addEventListener('click', () => $('transactionDialog').close());
for (const id of ['month','filterType','search']) $(id).addEventListener('input', render);
$('transactionForm').addEventListener('submit', async e => {
  e.preventDefault(); $('formError').textContent = '';
  const id = $('transactionId').value;
  const data = {descricao:$('description').value.trim(), tipo:$('type').value, categoria:$('category').value.trim(), valor:Number($('amount').value), data:$('date').value};
  if (!data.descricao || !data.categoria) { $('formError').textContent = 'Preencha descrição e categoria.'; return; }
  try { await request('/api/transacoes' + (id ? '/' + id : ''), {method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); $('month').value = data.data.slice(0,7); $('transactionDialog').close(); await load(); notify(id ? 'Lançamento atualizado.' : 'Lançamento adicionado.'); }
  catch (error) { $('formError').textContent = error.message; }
});
$('transactionList').addEventListener('click', async e => {
  const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-delete]');
  if (edit) openForm(transactions.find(t => t.id === Number(edit.dataset.edit)));
  if (del) { const item = transactions.find(t => t.id === Number(del.dataset.delete)); if (!item || !confirm(`Excluir o lançamento “${item.descricao}”?`)) return; try { await request('/api/transacoes/'+item.id,{method:'DELETE'}); await load(); notify('Lançamento excluído.'); } catch (error) { notify(error.message); } }
});
$('exportCsv').addEventListener('click', () => {
  const rows = filtered(); if (!rows.length) { notify('Não há lançamentos para exportar com os filtros atuais.'); return; }
  const cell = value => { let s=String(value); if (/^[\s]*[=+@\-\t\r]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; };
  const csv = [['Data','Descrição','Tipo','Categoria','Valor (R$)'],...rows.map(t=>[t.data,t.descricao,t.tipo,t.categoria,t.valor.toFixed(2).replace('.',',')])].map(r=>r.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})); const a = document.createElement('a'); a.href=url; a.download=`clareza-${$('month').value}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('month').value = localDate().slice(0,7); load();

