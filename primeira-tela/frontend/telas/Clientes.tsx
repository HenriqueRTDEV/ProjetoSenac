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
  cpf: string;
  telefone: string;
  email: string;
};

function Campo({
  titulo,
  valor,
  alterar,
  teclado = 'default',
}: {
  titulo: string;
  valor: string;
  alterar: (texto: string) => void;
  teclado?: 'default' | 'email-address' | 'phone-pad';
}) {
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
        keyboardType={teclado}
        autoCapitalize={teclado === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  );
}

function Botao({
  titulo,
  acao,
  tipo = 'claro',
}: {
  titulo: string;
  acao: () => void;
  tipo?: 'principal' | 'claro' | 'perigo';
}) {
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
      className={`min-h-9 flex-1 items-center justify-center rounded-md px-2 py-2 ${fundo}`}
    >
      <Text className={`text-center text-[10px] font-semibold ${corTexto}`}>
        {titulo}
      </Text>
    </Pressable>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  async function carregarClientes() {
    try {
      const resposta = await fetch(`${API}/clientes`);

      if (!resposta.ok) {
        throw new Error('Não foi possível carregar os clientes.');
      }

      const dados: Cliente[] = await resposta.json();

      setClientes(dados);
      setErro('');
    } catch {
      setErro('Não foi possível conectar à API. Verifique se o backend está ativo.');
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  function limparFormulario() {
    setEditando(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEmail('');
  }

  async function salvarCliente() {
    if (
      !nome.trim() ||
      !cpf.trim() ||
      !telefone.trim() ||
      !email.trim()
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      const resposta = await fetch(
        editando ? `${API}/clientes/${editando}` : `${API}/clientes`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, cpf, telefone, email }),
        },
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível salvar o cliente.');
      }

      limparFormulario();
      await carregarClientes();

      Alert.alert('Sucesso', 'Cliente salvo com sucesso!');
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof Error ? e.message : 'Erro ao salvar cliente.',
      );
    }
  }

  function editarCliente(cliente: Cliente) {
    setEditando(cliente.id);
    setNome(cliente.nome);
    setCpf(cliente.cpf);
    setTelefone(cliente.telefone);
    setEmail(cliente.email);
  }

  function excluirCliente(id: string) {
    Alert.alert('Excluir cliente', 'Deseja realmente excluir este cliente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const resposta = await fetch(`${API}/clientes/${id}`, {
              method: 'DELETE',
            });

            if (!resposta.ok) {
              throw new Error('Não foi possível excluir o cliente.');
            }

            if (editando === id) limparFormulario();

            await carregarClientes();
          } catch (e) {
            Alert.alert(
              'Erro',
              e instanceof Error ? e.message : 'Erro ao excluir cliente.',
            );
          }
        },
      },
    ]);
  }

  const filtrados = clientes.filter((cliente) =>
    `${cliente.nome} ${cliente.cpf} ${cliente.telefone}`
      .toLowerCase()
      .includes(busca.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-[#F3F6FA]">
      {/* Cabeçalho */}
      <View className="bg-[#173253] px-5 pb-5 pt-3">
        <Text className="mb-3 text-[10px] tracking-widest text-[#DCE8F7]">
          ⚒  OFICINA CENTRAL
        </Text>

        <Text className="text-2xl font-bold text-white">
          Clientes
        </Text>

        <Text className="mt-1 text-xs text-[#D0DDED]">
          Cadastros e contatos sempre à mão.
        </Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-3 pb-5 pt-3">
          {erro !== '' && (
            <View className="mb-3 rounded-lg bg-red-100 p-3">
              <Text className="text-xs text-red-800">{erro}</Text>
              <Pressable onPress={carregarClientes} className="mt-2">
                <Text className="font-bold text-red-800">Tentar novamente</Text>
              </Pressable>
            </View>
          )}

          {/* Formulário */}
          <View className="mb-4 rounded-xl border border-[#DDE5EF] bg-white p-3">
            <Text className="text-base font-bold text-[#203752]">
              Dados do cliente
            </Text>

            <Text className="mb-3 mt-1 text-[11px] text-[#718096]">
              {editando
                ? 'Edite os dados do cliente.'
                : 'Cadastre um novo cliente.'}
            </Text>

            <Campo
              titulo="Nome completo"
              valor={nome}
              alterar={setNome}
            />

            <View className="flex-row gap-2">
              <Campo titulo="CPF" valor={cpf} alterar={setCpf} />
              <Campo
                titulo="Telefone"
                valor={telefone}
                alterar={setTelefone}
                teclado="phone-pad"
              />
            </View>

            <Campo
              titulo="E-mail"
              valor={email}
              alterar={setEmail}
              teclado="email-address"
            />

            <View className="flex-row gap-2">
              <Botao
                titulo="Cancelar"
                acao={limparFormulario}
              />

              <Botao
                titulo={editando ? 'Salvar alterações' : '+ Cadastrar'}
                acao={salvarCliente}
                tipo="principal"
              />
            </View>
          </View>

          {/* Lista de clientes */}
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#203752]">
              Clientes cadastrados
            </Text>

            <Text className="text-[10px] text-[#718096]">
              {clientes.length} clientes
            </Text>
          </View>

          <View className="mb-2 flex-row items-center rounded-lg border border-[#E0E7F0] bg-white px-3">
            <Text className="mr-2 text-lg text-[#718096]">⌕</Text>
            <TextInput
              className="h-10 flex-1 text-xs text-[#243750]"
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome, CPF ou telefone"
              placeholderTextColor="#718096"
            />
          </View>

          {filtrados.map((cliente) => (
            <View
              key={cliente.id}
              className="mb-2 rounded-xl border border-[#DFE6EF] bg-white p-3"
            >
              <View className="mb-3 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8EFF7]">
                  <Text className="font-bold text-[#244D7D]">
                    {(cliente.nome || '?')
                      .split(' ')
                      .map((parte) => parte[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#203752]">
                    {cliente.nome}
                  </Text>
                  <Text className="mt-1 text-[10px] text-[#718096]">
                    {cliente.telefone}
                  </Text>
                </View>
              </View>

              <Text className="mb-1 text-[10px] text-[#718096]">
                {cliente.email}
              </Text>

              <Text className="mb-3 text-[10px] text-[#718096]">
                CPF: {cliente.cpf}
              </Text>

              <View className="flex-row gap-2">
                <Botao
                  titulo="Consultar"
                  acao={() =>
                    Alert.alert(
                      cliente.nome,
                      `CPF: ${cliente.cpf}\nTelefone: ${cliente.telefone}\nE-mail: ${cliente.email}`,
                    )
                  }
                />

                <Botao
                  titulo="Editar"
                  acao={() => editarCliente(cliente)}
                />

                <Botao
                  titulo="Excluir"
                  tipo="perigo"
                  acao={() => excluirCliente(cliente.id)}
                />
              </View>
            </View>
          ))}

          {filtrados.length === 0 && (
            <Text className="py-6 text-center text-xs text-[#718096]">
              {busca
                ? 'Nenhum cliente encontrado.'
                : 'Nenhum cliente cadastrado.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
