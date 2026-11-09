import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Tela from '../componentes/Tela';
import Botao from '../componentes/Botao';
import TreinoDia from '../componentes/TreinoDia';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';
import { buscarProximaAula } from '../servicos/aulasAluno';
import { exibirDataAula } from '../servicos/formularioAula';

export default function Inicio({ navigation: navegacao }) {
  const { aluno } = usarSessao();
  const [proximaAula, definirProximaAula] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState('');
  const [tentativa, definirTentativa] = useState(0);

  useFocusEffect(useCallback(() => {
    let telaAtiva = true;
    async function carregarProximaAula() {
      definirCarregando(true);
      definirErro('');
      try {
        const aula = await buscarProximaAula(aluno);
        if (telaAtiva) definirProximaAula(aula);
      } catch {
        if (telaAtiva) definirErro('Não foi possível consultar sua próxima aula.');
      } finally {
        if (telaAtiva) definirCarregando(false);
      }
    }
    if (Platform.OS !== 'web') carregarProximaAula();
    else definirCarregando(false);
    return () => { telaAtiva = false; };
  }, [aluno, tentativa]));

  return (
    <Tela titulo="Início" descricao="Acompanhe suas aulas e seu treino.">
      {Platform.OS !== 'web' ? (
        <View style={estilos.aula}>
          <Text style={estilos.titulo}>Próxima aula</Text>
          {carregando ? <ActivityIndicator color={cores.verde} accessibilityLabel="Consultando próxima aula" /> : erro ? (
            <>
              <Text accessibilityRole="alert" style={estilos.texto}>{erro}</Text>
              <Botao titulo="Tentar novamente" secundario aoPressionar={() => definirTentativa((valor) => valor + 1)} />
            </>
          ) : proximaAula ? (
            <>
              <Text style={estilos.nome}>{proximaAula.nome}</Text>
              <Text style={estilos.texto}>{exibirDataAula(proximaAula.data)} às {proximaAula.horario}</Text>
              <Text style={estilos.texto}>Instrutor: {proximaAula.instrutor}</Text>
              <Text style={estilos.texto}>Sua vaga está reservada.</Text>
            </>
          ) : <Text style={estilos.texto}>Você ainda não tem uma próxima aula reservada.</Text>}
        </View>
      ) : <Text style={estilos.texto}>Suas reservas ficam disponíveis no aplicativo do celular.</Text>}
      <TreinoDia aoEscolherExercicios={() => navegacao.navigate('Escolher exercícios')} />
      <Botao titulo="Ver aulas" aoPressionar={() => navegacao.navigate('Aulas')} />
      <Botao titulo="Ver estatísticas" secundario aoPressionar={() => navegacao.navigate('Estatísticas')} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  aula: { padding: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 12 },
  titulo: { color: cores.texto, fontSize: 18, fontWeight: '600' },
  nome: { color: cores.texto, fontSize: 16 },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
});
