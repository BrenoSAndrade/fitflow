import { Pressable, Text } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';
import Entrada from '../telas/Entrada';
import Inicio from '../telas/Inicio';
import AulasAluno from '../telas/AulasAluno';
import Estatisticas from '../telas/Estatisticas';
import GradeAulas from '../telas/GradeAulas';
import CriarAula from '../telas/CriarAula';
import EscolherExercicios from '../telas/EscolherExercicios';

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();
const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: cores.verde, background: cores.fundo, card: cores.superficie, text: cores.texto, border: cores.borda },
};

function AbasAluno() {
  return (
    <Abas.Navigator screenOptions={{
      headerShown: false,
      animation: 'none',
      tabBarActiveTintColor: cores.verde,
      tabBarInactiveTintColor: cores.secundario,
      tabBarIcon: () => null,
      tabBarLabelStyle: { fontSize: 13 },
      tabBarItemStyle: { justifyContent: 'center' },
    }}>
      <Abas.Screen name="Início" component={Inicio} />
      <Abas.Screen name="Aulas" component={AulasAluno} />
      <Abas.Screen name="Estatísticas" component={Estatisticas} />
    </Abas.Navigator>
  );
}

export default function Navegacao() {
  const { perfil, sair, ocupado } = usarSessao();
  return (
    <NavigationContainer theme={tema}>
      <Pilha.Navigator screenOptions={{
        animation: 'none',
        headerRight: () => perfil ? (
          <Pressable accessibilityRole="button" disabled={ocupado} onPress={sair} hitSlop={12} style={{ padding: 8 }}>
            <Text style={{ color: cores.verde, fontSize: 15 }}>Sair</Text>
          </Pressable>
        ) : null,
      }}>
        {!perfil ? (
          <Pilha.Screen name="Entrada" component={Entrada} options={{ headerShown: false }} />
        ) : perfil === 'aluno' ? (
          <Pilha.Group>
            <Pilha.Screen name="Aluno" component={AbasAluno} options={{ title: 'FitFlow' }} />
            <Pilha.Screen name="Escolher exercícios" component={EscolherExercicios} />
          </Pilha.Group>
        ) : (
          <Pilha.Group>
            <Pilha.Screen name="Grade" component={GradeAulas} options={{ title: 'FitFlow' }} />
            <Pilha.Screen name="Criar aula" component={CriarAula} />
          </Pilha.Group>
        )}
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
