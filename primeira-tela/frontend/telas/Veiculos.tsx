import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const API = 'http://10.0.2.2:3000';

type Cliente = {
  id: string;
  nome: string;
};

type Veiculo = {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  cor: string;
  quilometragem: string;
};

export default function Veiculos() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  const [editando, setEditando] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [quilometragem, setQuilometragem] = useState('');
  const [abrirClientes, setAbrirClientes] = useState(false);

  async function carregarDados() {
    try {
      const [resClientes, resVeiculos] = await Promise.all([
        fetch(`${API}/clientes`),
        fetch(`${API}/veiculos`),
      ]);

      if (!resClientes.ok || !resVeiculos.ok) {
        throw new Error('Não foi possível carregar os dados.');
      }

      setClientes(await resClientes.json());
      setVeiculos(await resVeiculos.json());
      setErro('');
    } catch {
      setErro('Não foi possível conectar à API. Confira o backend.');
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function limparFormulario() {
    setEditando('');
    setClienteId('');
    setMarca('');
    setModelo('');
    setPlaca('');
    setAno('');
    setCor('');
    setQuilometragem('');
    setAbrirClientes(false);
  }

  async function salvarVeiculo() {
    if (!clienteId || !marca.trim() || !modelo.trim() || !placa.trim()) {
      Alert.alert(
        'Atenção',
        'Selecione o proprietário e preencha marca, modelo e placa.',
      );
      return;
    }

    try {
      const resposta = await fetch(
        editando ? `${API}/veiculos/${editando}` : `${API}/veiculos`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteId,
            marca,
            modelo,
            placa,
            ano,
            cor,
            quilometragem,
          }),
        },
      );

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        throw new Error(dados.erro || 'Não foi possível salvar o veículo.');
      }

      limparFormulario();
      await carregarDados();
      Alert.alert('Sucesso', 'Veículo salvo com sucesso!');
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof Error ? e.message : 'Erro ao salvar veículo.',
      );
    }
  }

  function editarVeiculo(veiculo: Veiculo) {
    setEditando(veiculo.id);
    setClienteId(veiculo.clienteId);
    setMarca(veiculo.marca || '');
    setModelo(veiculo.modelo || '');
    setPlaca(veiculo.placa || '');
    setAno(veiculo.ano || '');
    setCor(veiculo.cor || '');
    setQuilometragem(veiculo.quilometragem || '');
    setBusca('');
    setAbrirClientes(false);
  }

  function excluirVeiculo(id: string) {
    Alert.alert('Excluir veículo', 'Deseja realmente excluir este veículo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const resposta = await fetch(`${API}/veiculos/${id}`, {
              method: 'DELETE',
            });

            if (!resposta.ok) {
              throw new Error('Não foi possível excluir o veículo.');
            }

            if (editando === id) limparFormulario();
            await carregarDados();
          } catch (e) {
            Alert.alert(
              'Erro',
              e instanceof Error ? e.message : 'Erro ao excluir veículo.',
            );
          }
        },
      },
    ]);
  }

  function nomeCliente(id: string) {
    return clientes.find(cliente => cliente.id === id)?.nome || 'Cliente não encontrado';
  }

  const filtrados = veiculos.filter(veiculo =>
    `${veiculo.marca} ${veiculo.modelo} ${veiculo.placa} ${nomeCliente(veiculo.clienteId)}`
      .toLowerCase()
      .includes(busca.toLowerCase()),
  );

  function campo(
    titulo: string,
    valor: string,
    alterar: (texto: string) => void,
    numerico = false,
  ) {
    return (
      <View className="mb-3 flex-1">
        <Text className="mb-1 text-[11px] font-semibold text-[#203752]">
          {titulo}
        </Text>

        <TextInput
          className="h-10 rounded-md border border-[#E1E7F0] bg-[#F9FAFC] px-3 text-xs text-[#273A52]"
          value={valor}
          onChangeText={alterar}
          placeholder={titulo}
          placeholderTextColor="#8998AA"
          keyboardType={numerico ? 'numeric' : 'default'}
          autoCapitalize="words"
        />
      </View>
    );
  }

  function botao(
    titulo: string,
    acao: () => void,
    tipo: 'principal' | 'claro' | 'perigo' = 'claro',
  ) {
    const fundo =
      tipo === 'principal'
        ? 'bg-[#173253]'
        : tipo === 'perigo'
          ? 'bg-[#FBF0F0]'
          : 'bg-[#EAF0F7]';

    const texto =
      tipo === 'principal'
        ? 'text-white'
        : tipo === 'perigo'
          ? 'text-[#B45353]'
          : 'text-[#29425F]';

    return (
      <Pressable
        onPress={acao}
        className={`min-h-9 flex-1 items-center justify-center rounded-md px-2 py-2 ${fundo}`}
      >
        <Text className={`text-center text-[10px] font-semibold ${texto}`}>
          {titulo}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="flex-1 bg-[#F3F6FA]">
      <View className="bg-[#173253] px-5 pb-5 pt-3">
        <Text className="mb-3 text-[10px] tracking-widest text-[#DCE8F7]">
          ⚒  OFICINA CENTRAL
        </Text>

        <Text className="text-2xl font-bold text-white">Veículos</Text>

        <Text className="mt-1 text-xs text-[#D0DDED]">
          Cada veículo vinculado ao seu proprietário.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3 pb-5 pt-3">
          {erro !== '' && (
            <Text className="mb-3 rounded-lg bg-red-100 p-3 text-xs text-red-800">
              {erro}
            </Text>
          )}

          <View className="mb-4 rounded-xl border border-[#DDE5EF] bg-white p-3">
            <Text className="text-base font-bold text-[#203752]">
              Dados do veículo
            </Text>

            <Text className="mb-3 mt-1 text-[11px] text-[#718096]">
              {editando
                ? 'Editando os dados do veículo.'
                : 'Cadastre o veículo e vincule um proprietário.'}
            </Text>

            <Text className="mb-1 text-[11px] font-semibold text-[#203752]">
              Cliente proprietário
            </Text>

            <Pressable
              onPress={() => setAbrirClientes(!abrirClientes)}
              className="mb-3 min-h-10 flex-row items-center justify-between rounded-md border border-[#E1E7F0] bg-[#F9FAFC] px-3 py-2"
            >
              <Text
                className={`flex-1 text-xs ${
                  clienteId ? 'text-[#273A52]' : 'text-[#8998AA]'
                }`}
              >
                {clientes.find(c => c.id === clienteId)?.nome ||
                  'Selecione um cliente'}
              </Text>

              <Text className="ml-2 text-sm text-[#718096]">
                {abrirClientes ? '⌃' : '⌄'}
              </Text>
            </Pressable>

            {abrirClientes && (
              <View className="mb-3 rounded-md border border-[#E1E7F0] bg-white">
                {clientes.length === 0 ? (
                  <Text className="p-3 text-xs text-[#718096]">
                    Cadastre um cliente primeiro.
                  </Text>
                ) : (
                  clientes.map(cliente => (
                    <Pressable
                      key={cliente.id}
                      onPress={() => {
                        setClienteId(cliente.id);
                        setAbrirClientes(false);
                      }}
                      className="border-b border-[#EDF1F6] px-3 py-3"
                    >
                      <Text className="text-xs text-[#273A52]">
                        {cliente.nome}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            <View className="flex-row gap-2">
              {campo('Marca', marca, setMarca)}
              {campo('Modelo', modelo, setModelo)}
            </View>

            <View className="flex-row gap-2">
              {campo('Placa', placa, setPlaca)}
              {campo('Ano', ano, setAno, true)}
            </View>

            <View className="flex-row gap-2">
              {campo('Cor', cor, setCor)}
              {campo('Quilometragem', quilometragem, setQuilometragem, true)}
            </View>

            <View className="flex-row gap-2">
              {botao('Cancelar', limparFormulario)}
              {botao(
                editando ? '✓ Salvar alterações' : '+ Cadastrar',
                salvarVeiculo,
                'principal',
              )}
            </View>
          </View>

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#203752]">
              Veículos cadastrados
            </Text>

            <Text className="text-[10px] text-[#718096]">
              {veiculos.length} veículos
            </Text>
          </View>

          <View className="mb-2 flex-row items-center rounded-lg border border-[#E0E7F0] bg-white px-3">
            <Text className="mr-2 text-lg text-[#718096]">⌕</Text>

            <TextInput
              className="h-10 flex-1 text-xs text-[#243750]"
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por placa, modelo ou cliente"
              placeholderTextColor="#718096"
            />
          </View>

          {filtrados.map(veiculo => (
            <View
              key={veiculo.id}
              className="mb-2 rounded-xl border border-[#DFE6EF] bg-white p-3"
            >
              <View className="mb-2 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#EAF0F7]">
                  <Text className="text-lg text-[#365A83]">▱</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#203752]">
                    {veiculo.marca} {veiculo.modelo}
                  </Text>

                  <Text className="mt-1 text-[10px] text-[#718096]">
                    {veiculo.ano} · {veiculo.cor}
                  </Text>
                </View>

                <View className="rounded border border-[#E0E7F0] px-2 py-1">
                  <Text className="text-[10px] font-bold text-[#203752]">
                    {veiculo.placa}
                  </Text>
                </View>
              </View>

              <Text className="mb-3 text-[10px] text-[#718096]">
                ♙  {nomeCliente(veiculo.clienteId)} · Proprietário
              </Text>

              <View className="flex-row gap-2">
                {botao('✎ Editar veículo', () => editarVeiculo(veiculo))}
                {botao(
                  'Excluir',
                  () => excluirVeiculo(veiculo.id),
                  'perigo',
                )}
              </View>
            </View>
          ))}

          {filtrados.length === 0 && (
            <Text className="py-6 text-center text-xs text-[#718096]">
              {busca
                ? 'Nenhum veículo encontrado.'
                : 'Nenhum veículo cadastrado.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
