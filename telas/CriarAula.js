import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { criarAula } from '../banco/aulas';
import Campo from '../componentes/Campo';
import Tela from '../componentes/Tela';
import Botao from '../componentes/Botao';
import { cores } from '../componentes/tema';
import { prepararDadosAula } from '../servicos/formularioAula';

export default function CriarAula({ navigation: navegacao }) {
  const [nome, definirNome] = useState('');
  const [instrutor, definirInstrutor] = useState('');
  const [data, definirData] = useState('');
  const [horario, definirHorario] = useState('');
  const [vagas, definirVagas] = useState('');
  const [salvando, definirSalvando] = useState(false);
  const [erro, definirErro] = useState('');
  const envioEmAndamento = useRef(false);

  async function salvar() {
    if (envioEmAndamento.current) return;
    definirErro('');
    let dados;
    try {
      dados = prepararDadosAula({ nome, instrutor, data, horario, vagas });
    } catch (falha) {
      definirErro(falha.message);
      return;
    }
    if (Platform.OS === 'web') {
      definirErro('Para salvar a aula, use o aplicativo no celular.');
      return;
    }
    envioEmAndamento.current = true;
    definirSalvando(true);
    try {
      await criarAula(dados);
      if (navegacao.isFocused()) navegacao.goBack();
    } catch {
      definirErro('Não foi possível salvar a aula. Tente novamente.');
    } finally {
      envioEmAndamento.current = false;
      definirSalvando(false);
    }
  }

  return (
    <Tela titulo="Criar aula" descricao="Preencha os dados da aula.">
      <Campo rotulo="Nome da aula" valor={nome} aoAlterar={definirNome} exemplo="Ex.: Funcional" editavel={!salvando} />
      <Campo rotulo="Instrutor" valor={instrutor} aoAlterar={definirInstrutor} exemplo="Ex.: Carla" editavel={!salvando} />
      <Campo rotulo="Data (DD/MM/AAAA)" valor={data} aoAlterar={definirData} exemplo="Ex.: 14/11/2026" teclado="numbers-and-punctuation" limite={10} editavel={!salvando} />
      <Campo rotulo="Horário (HH:MM)" valor={horario} aoAlterar={definirHorario} exemplo="Ex.: 18:00" teclado="numbers-and-punctuation" limite={5} editavel={!salvando} />
      <Campo rotulo="Vagas" valor={vagas} aoAlterar={definirVagas} exemplo="Ex.: 15" teclado="number-pad" limite={4} editavel={!salvando} />
      {erro ? <Text accessibilityRole="alert" style={estilos.erro}>{erro}</Text> : null}
      <Botao titulo={salvando ? 'Salvando...' : 'Salvar aula'} desabilitado={salvando} aoPressionar={salvar} />
      <Botao titulo="Cancelar" secundario desabilitado={salvando} aoPressionar={() => navegacao.goBack()} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  erro: { color: cores.texto, fontSize: 14, lineHeight: 21 },
});
