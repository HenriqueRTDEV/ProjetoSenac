const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Bancos de dados simulados em memória
let clientes = [];
let veiculos = [];
let ordensServico = [];

// --- ROTAS DE CLIENTES ---
app.get('/clientes', (req, res) => res.json(clientes));
app.get('/clientes/:id', (req, res) => {
    const cliente = clientes.find(c => c.id == req.params.id);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(cliente);
});
app.post('/clientes', (req, res) => {
    const novo = { id: Date.now().toString(), ...req.body };
    clientes.push(novo);
    res.status(201).json(novo);
});
app.put('/clientes/:id', (req, res) => {
    const index = clientes.findIndex(c => c.id == req.params.id);
    if (index < 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    clientes[index] = { id: req.params.id, ...req.body };
    res.json(clientes[index]);
});
app.delete('/clientes/:id', (req, res) => {
    clientes = clientes.filter(c => c.id != req.params.id);
    res.status(204).send();
});

// --- ROTAS DE VEÍCULOS ---
app.get('/veiculos', (req, res) => res.json(veiculos));
app.get('/veiculos/:id', (req, res) => {
    const veiculo = veiculos.find(v => v.id == req.params.id);
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });
    res.json(veiculo);
});
app.post('/veiculos', (req, res) => {
    const { clienteId } = req.body;
    const clienteExiste = clientes.some(c => c.id == clienteId);
    if (!clienteExiste) return res.status(400).json({ erro: 'Cliente associado inexistente!' });
    
    const novo = { id: Date.now().toString(), ...req.body };
    veiculos.push(novo);
    res.status(201).json(novo);
});
app.put('/veiculos/:id', (req, res) => {
    const index = veiculos.findIndex(v => v.id == req.params.id);
    if (index < 0) return res.status(404).json({ erro: 'Veículo não encontrado' });
    veiculos[index] = { id: req.params.id, ...req.body };
    res.json(veiculos[index]);
});
app.delete('/veiculos/:id', (req, res) => {
    veiculos = veiculos.filter(v => v.id != req.params.id);
    res.status(204).send();
});

// --- ROTAS DE ORDENS DE SERVIÇO ---
app.get('/ordens-servico', (req, res) => res.json(ordensServico));
app.get('/ordens-servico/:id', (req, res) => {
    const os = ordensServico.find(o => o.id == req.params.id);
    if (!os) return res.status(404).json({ erro: 'Ordem de serviço não encontrada' });
    res.json(os);
});
app.post('/ordens-servico', (req, res) => {
    const novo = { id: Date.now().toString(), status: 'Aberta', ...req.body };
    ordensServico.push(novo);
    res.status(201).json(novo);
});
app.put('/ordens-servico/:id', (req, res) => {
    const index = ordensServico.findIndex(o => o.id == req.params.id);
    if (index < 0) return res.status(404).json({ erro: 'Ordem de serviço não encontrada' });
    ordensServico[index] = { id: req.params.id, ...req.body };
    res.json(ordensServico[index]);
});
app.delete('/ordens-servico/:id', (req, res) => {
    ordensServico = ordensServico.filter(o => o.id != req.params.id);
    res.status(204).send();
});

app.listen(3000, () => console.log('API rodando na porta 3000 🚀'));