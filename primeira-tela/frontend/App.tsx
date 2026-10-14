import './global.css';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Clientes from './telas/Clientes';
import Veiculos from './telas/Veiculos';
import OrdensServico from './telas/OrdensServico';

const abas = [
  { nome: 'Clientes', icone: '♙' },
  { nome: 'Veículos', icone: '▱' },
  { nome: 'Ordens de Serviço', icone: '▤' },
];

export default function App() {
  const [tela, setTela] = useState('Clientes');

  return (
    <View className="flex-1 bg-[#F3F6FA]">
      <StatusBar style="light" backgroundColor="#173253" />

      {tela === 'Clientes' ? (
        <Clientes />
      ) : tela === 'Veículos' ? (
        <Veiculos />
      ) : tela === 'Ordens de Serviço' ? (
        <OrdensServico />
      ) : (
        <View className="flex-1 items-center justify-center bg-[#F3F6FA]">
          <Text className="text-lg font-bold text-[#203752]">
            Ordens de Serviço
          </Text>
          <Text className="mt-2 text-sm text-[#718096]">
            Próxima etapa do projeto.
          </Text>
        </View>
      )}

      <View className="flex-row border-t border-[#E0E7F0] bg-white px-2 pb-2 pt-2">
        {abas.map((aba) => (
          <Pressable
            key={aba.nome}
            onPress={() => setTela(aba.nome)}
            className={`flex-1 items-center justify-center rounded-lg py-2 ${tela === aba.nome ? 'bg-[#EAF0F7]' : 'bg-white'
              }`}
          >
            <Text
              className={`text-base ${tela === aba.nome
                  ? 'font-bold text-[#244D7D]'
                  : 'text-[#718096]'
                }`}
            >
              {aba.icone}
            </Text>

            <Text
              className={`mt-1 text-center text-[9px] ${tela === aba.nome
                  ? 'font-bold text-[#244D7D]'
                  : 'text-[#718096]'
                }`}
            >
              {aba.nome}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
