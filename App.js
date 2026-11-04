import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProvedorSessao } from './contextos/Sessao';
import Navegacao from './navegacao/Navegacao';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProvedorSessao>
        <StatusBar style="light" />
        <Navegacao />
      </ProvedorSessao>
    </SafeAreaProvider>
  );
}
