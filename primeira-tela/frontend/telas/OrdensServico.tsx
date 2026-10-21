
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
};

type Ordem = {
  id: string;
  clienteId: string;
  veiculoId: string;
  descricao: string;
  status: string;
};

const STATUS = [
  'Aberta',
  'Em andamento',
  'Aguardando peças',
  'Concluída',
];

export default function OrdensServico() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [statusInicial, setStatusInicial] = useState('Aberta');

  const [seletorAberto, setSeletorAberto] = useState('');

  async function carregarDados() {
    try {
      const [resClientes, resVeiculos, resOrdens] = await Promise.all([
        fetch(`${API}/clientes`),
        fetch(`${API}/veiculos`),
        fetch(`${API}/ordens-servico`),
      ]);

      if (!resClientes.ok || !resVeiculos.ok || !resOrdens.ok) {
        throw new Error('Não foi possível carregar os dados.');
      }

      setClientes(await resClientes.json());
      setVeiculos(await resVeiculos.json());
      setOrdens(await resOrdens.json());
      setErro('');
    } catch {
      setErro(
        'Não foi possível conectar à API. Verifique se o backend está ativo.',
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function nomeCliente(id: string) {
    return (
      clientes.find(cliente => cliente.id === id)?.nome ||
      'Cliente não encontrado'
    );
  }

  function nomeVeiculo(id: string) {
    const veiculo = veiculos.find(item => item.id === id);

    if (!veiculo) return 'Veículo não encontrado';

    return `${veiculo.marca} ${veiculo.modelo} · ${veiculo.placa}`;
  }

  async function abrirOrdem() {
    if (!clienteId || !veiculoId || !descricao.trim()) {
      Alert.alert(
        'Atenção',
        'Selecione o cliente, o veículo e informe a descrição do serviço.',
      );
      return;
    }

    try {
      const resposta = await fetch(`${API}/ordens-servico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId,
          veiculoId,
          descricao,
          status: statusInicial,
        }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        throw new Error(
          dados.erro || 'Não foi possível abrir a ordem.',
        );
      }

      setClienteId('');
      setVeiculoId('');
      setDescricao('');
      setStatusInicial('Aberta');
      setSeletorAberto('');

      await carregarDados();

      Alert.alert('Sucesso', 'Ordem de serviço aberta!');
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof Error ? e.message : 'Erro ao abrir a ordem.',
      );
    }
  }

  async function atualizarStatus(ordem: Ordem) {
    const indice = STATUS.indexOf(ordem.status || 'Aberta');
    const proximo = STATUS[(indice + 1) % STATUS.length];

    try {
      const resposta = await fetch(
        `${API}/ordens-servico/${ordem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clienteId: ordem.clienteId,
            veiculoId: ordem.veiculoId,
            descricao: ordem.descricao,
            status: proximo,
          }),
        },
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível atualizar o status.');
      }

      await carregarDados();
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof Error ? e.message : 'Erro ao atualizar status.',
      );
    }
  }

  function consultarOrdem(ordem: Ordem) {
    Alert.alert(
      `Ordem de Serviço #${ordem.id.slice(-4)}`,
      `Cliente: ${nomeCliente(ordem.clienteId)}\n\n` +
        `Veículo: ${nomeVeiculo(ordem.veiculoId)}\n\n` +
        `Descrição: ${ordem.descricao}\n\n` +
        `Status: ${ordem.status || 'Aberta'}`,
    );
  }

  function excluirOrdem(id: string) {
    Alert.alert(
      'Excluir ordem de serviço',
      'Deseja realmente excluir esta ordem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const resposta = await fetch(
                `${API}/ordens-servico/${id}`,
                { method: 'DELETE' },
              );

              if (!resposta.ok) {
                throw new Error('Não foi possível excluir a ordem.');
              }

              await carregarDados();
            } catch (e) {
              Alert.alert(
                'Erro',
                e instanceof Error
                  ? e.message
                  : 'Erro ao excluir a ordem.',
              );
            }
          },
        },
      ],
    );
  }

  const veiculosDoCliente = veiculos.filter(
    veiculo => veiculo.clienteId === clienteId,
  );

  const ordensFiltradas = ordens.filter(ordem =>
    `OS ${ordem.id} ${nomeCliente(ordem.clienteId)} ${nomeVeiculo(ordem.veiculoId)} ${ordem.descricao} ${ordem.status}`
      .toLowerCase()
      .includes(busca.toLowerCase()),
  );

  function seletor(
    titulo: string,
    valor: string,
    opcoes: { label: string; value: string }[],
    aberto: boolean,
    alternar: () => void,
    selecionar: (valor: string) => void,
    placeholder: string,
  ) {
    const selecionado = opcoes.find(opcao => opcao.value === valor);

    return (
      <View className="mb-3">
        <Text className="mb-1 text-xs font-semibold text-[#203752]">
          {titulo}
        </Text>

        <Pressable
          onPress={alternar}
          className="min-h-11 flex-row items-center justify-between rounded-md border border-[#E1E7F0] bg-[#F9FAFC] px-3 py-2"
        >
          <Text
            numberOfLines={2}
            className={`flex-1 text-sm ${
              selecionado ? 'text-[#273A52]' : 'text-[#8998AA]'
            }`}
          >
            {selecionado?.label || placeholder}
          </Text>

          <Text className="ml-2 text-base text-[#718096]">
            {aberto ? '⌃' : '⌄'}
          </Text>
        </Pressable>

        {aberto && (
          <View className="mt-1 rounded-md border border-[#E1E7F0] bg-white">
            {opcoes.length === 0 ? (
              <Text className="p-3 text-sm text-[#718096]">
                Nenhuma opção disponível.
              </Text>
            ) : (
              opcoes.map(opcao => (
                <Pressable
                  key={opcao.value}
                  onPress={() => selecionar(opcao.value)}
                  className="border-b border-[#EDF1F6] px-3 py-3"
                >
                  <Text className="text-sm text-[#273A52]">
                    {opcao.label}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
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

    const corTexto =
      tipo === 'principal'
        ? 'text-white'
        : tipo === 'perigo'
          ? 'text-[#B45353]'
          : 'text-[#29425F]';

    return (
      <Pressable
        onPress={acao}
        className={`min-h-10 flex-1 items-center justify-center rounded-md px-1 py-2 ${fundo}`}
      >
        <Text
          className={`text-center text-xs font-semibold ${corTexto}`}
        >
          {titulo}
        </Text>
      </Pressable>
    );
  }

  function estiloStatus(status: string) {
    if (status === 'Concluída') {
      return {
        fundo: 'bg-[#E7F3EB]',
        texto: 'text-[#31734B]',
      };
    }

    if (status === 'Em andamento') {
      return {
        fundo: 'bg-[#EAF0F7]',
        texto: 'text-[#365A83]',
      };
    }

    if (status === 'Aguardando peças') {
      return {
        fundo: 'bg-[#FFF1D6]',
        texto: 'text-[#946619]',
      };
    }

    return {
      fundo: 'bg-[#EEF1F5]',
      texto: 'text-[#536579]',
    };
  }

  return (
    <View className="flex-1 bg-[#F3F6FA]">
      {/* Cabeçalho */}
      <View className="bg-[#173253] px-5 pb-5 pt-3">
        <Text className="mb-3 text-[11px] tracking-widest text-[#DCE8F7]">
          ⚒  OFICINA CENTRAL
        </Text>

        <Text className="text-2xl font-bold text-white">
          Ordens de Serviço
        </Text>

        <Text className="mt-1 text-sm text-[#D0DDED]">
          Da abertura à conclusão, tudo organizado.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3 pb-5 pt-3">
          {erro !== '' && (
            <View className="mb-3 rounded-lg bg-red-100 p-3">
              <Text className="text-sm text-red-800">
                {erro}
              </Text>

              <Pressable
                onPress={carregarDados}
                className="mt-2"
              >
                <Text className="text-sm font-bold text-red-800">
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          )}

          {/* Formulário de abertura */}
          <View className="mb-4 rounded-xl border border-[#DDE5EF] bg-white p-3">
            <Text className="text-lg font-bold text-[#203752]">
              Abrir ordem de serviço
            </Text>

            <Text className="mb-4 mt-1 text-xs text-[#718096]">
              Vincule o cliente e o veículo ao serviço.
            </Text>

            {seletor(
              'Cliente',
              clienteId,
              clientes.map(cliente => ({
                label: cliente.nome,
                value: cliente.id,
              })),
              seletorAberto === 'cliente',
              () =>
                setSeletorAberto(
                  seletorAberto === 'cliente' ? '' : 'cliente',
                ),
              valor => {
                setClienteId(valor);
                setVeiculoId('');
                setSeletorAberto('');
              },
              'Selecione um cliente',
            )}

            {seletor(
              'Veículo do cliente',
              veiculoId,
              veiculosDoCliente.map(veiculo => ({
                label: `${veiculo.marca} ${veiculo.modelo} · ${veiculo.placa}`,
                value: veiculo.id,
              })),
              seletorAberto === 'veiculo',
              () =>
                setSeletorAberto(
                  seletorAberto === 'veiculo' ? '' : 'veiculo',
                ),
              valor => {
                setVeiculoId(valor);
                setSeletorAberto('');
              },
              'Selecione um veículo',
            )}

            <View className="mb-3">
              <Text className="mb-1 text-xs font-semibold text-[#203752]">
                Descrição do serviço
              </Text>

              <TextInput
                className="min-h-20 rounded-md border border-[#E1E7F0] bg-[#F9FAFC] px-3 py-3 text-sm text-[#273A52]"
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descreva o serviço a ser realizado..."
                placeholderTextColor="#8998AA"
                multiline
                textAlignVertical="top"
              />
            </View>

            {seletor(
              'Status inicial',
              statusInicial,
              STATUS.map(status => ({
                label: status,
                value: status,
              })),
              seletorAberto === 'status',
              () =>
                setSeletorAberto(
                  seletorAberto === 'status' ? '' : 'status',
                ),
              valor => {
                setStatusInicial(valor);
                setSeletorAberto('');
              },
              'Selecione o status',
            )}

            <Pressable
              onPress={abrirOrdem}
              className="min-h-12 items-center justify-center rounded-md bg-[#173253] px-3 py-3"
            >
              <Text className="text-sm font-semibold text-white">
                +  Abrir ordem de serviço
              </Text>
            </Pressable>
          </View>

          {/* Lista de ordens */}
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-bold text-[#203752]">
              Ordens registradas
            </Text>

            <Text className="text-xs text-[#718096]">
              {ordens.length} ordens
            </Text>
          </View>

          {/* Busca */}
          <View className="mb-3 flex-row items-center rounded-lg border border-[#E0E7F0] bg-white px-3">
            <Text className="mr-2 text-xl text-[#718096]">
              ⌕
            </Text>

            <TextInput
              className="h-11 flex-1 text-sm text-[#243750]"
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nº da OS, cliente ou placa"
              placeholderTextColor="#718096"
            />
          </View>

          {ordensFiltradas.map(ordem => {
            const statusAtual = ordem.status || 'Aberta';
            const cores = estiloStatus(statusAtual);

            return (
              <View
                key={ordem.id}
                className="mb-3 rounded-xl border border-[#DFE6EF] bg-white p-3"
              >
                <View className="mb-3 flex-row items-center justify-between gap-2">
                  <Text className="text-sm font-bold text-[#203752]">
                    OS #{ordem.id.slice(-4)}
                  </Text>

                  <View className={`rounded-full px-3 py-1 ${cores.fundo}`}>
                    <Text className={`text-xs font-semibold ${cores.texto}`}>
                      {statusAtual}
                    </Text>
                  </View>
                </View>

                <Text className="mb-1 text-sm font-semibold text-[#203752]">
                  {nomeCliente(ordem.clienteId)}
                </Text>

                <Text className="mb-2 text-xs text-[#718096]">
                  ▱  {nomeVeiculo(ordem.veiculoId)}
                </Text>

                <Text className="mb-3 text-sm leading-5 text-[#40536B]">
                  {ordem.descricao}
                </Text>

                <Text className="mb-3 text-xs text-[#718096]">
                  Ordem registrada
                </Text>

                <View className="flex-row gap-2">
                  {botao(
                    'Consultar',
                    () => consultarOrdem(ordem),
                  )}

                  {botao(
                    'Atualizar status',
                    () => atualizarStatus(ordem),
                  )}

                  {botao(
                    'Excluir',
                    () => excluirOrdem(ordem.id),
                    'perigo',
                  )}
                </View>
              </View>
            );
          })}

          {ordensFiltradas.length === 0 && (
            <Text className="py-6 text-center text-sm text-[#718096]">
              {busca
                ? 'Nenhuma ordem encontrada.'
                : 'Nenhuma ordem de serviço cadastrada.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}