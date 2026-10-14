
import './global.css';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top']}
        className="flex-1 bg-[#173253]"
      >
        <View className="flex-1 bg-[#F3F6FA]">
          <StatusBar style="light" backgroundColor="#173253" />

          {tela === 'Clientes' ? (
            <Clientes />
          ) : tela === 'Veículos' ? (
            <Veiculos />
          ) : (
            <OrdensServico />
          )}

          <View className="flex-row border-t border-[#E0E7F0] bg-white px-2 pb-2 pt-2">
            {abas.map((aba) => (
              <Pressable
                key={aba.nome}
                onPress={() => setTela(aba.nome)}
                className={`flex-1 items-center justify-center rounded-lg py-2 ${
                  tela === aba.nome ? 'bg-[#EAF0F7]' : 'bg-white'
                }`}
              >
                <Text
                  className={`text-base ${
                    tela === aba.nome
                      ? 'font-bold text-[#244D7D]'
                      : 'text-[#718096]'
                  }`}
                >
                  {aba.icone}
                </Text>

                <Text
                  className={`mt-1 text-center text-[11px] ${
                    tela === aba.nome
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
