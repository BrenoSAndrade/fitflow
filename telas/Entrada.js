import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Botao from '../componentes/Botao';
import Campo from '../componentes/Campo';
import { normalizarEmail } from '../banco/usuarios';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';

export default function Entrada() {
  const [perfil, definirPerfil] = useState('aluno');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [erro, definirErro] = useState('');
  const { entrar, ocupado } = usarSessao();

  async function enviar() {
    if (ocupado) return;
    definirErro('');
    let emailValido;
    try {
      emailValido = normalizarEmail(email);
      if (!senha.length) {
        definirErro('Informe a senha.');
        return;
      }
    } catch (falha) {
      definirErro(falha.message);
      return;
    }
    if (Platform.OS === 'web') {
      definirErro('Para entrar com as contas locais, use o aplicativo no celular.');
      return;
    }
    try {
      await entrar(emailValido, senha, perfil);
    } catch {
      definirErro('Não foi possível entrar. Confira e-mail, senha e perfil e tente novamente.');
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={estilos.conteudo}>
          <Text accessibilityRole="header" style={estilos.titulo}>FitFlow</Text>
          <Text style={estilos.descricao}>Sua academia na palma da mão</Text>
          <View style={estilos.perfis}>
            {['aluno', 'funcionario'].map((opcao) => (
              <Pressable key={opcao} accessibilityRole="radio"
                accessibilityState={{ checked: perfil === opcao, disabled: ocupado }}
                disabled={ocupado}
                onPress={() => { definirPerfil(opcao); definirErro(''); }}
                style={[estilos.perfil, perfil === opcao && estilos.selecionado]}>
                <Text style={[estilos.nomePerfil, perfil === opcao && estilos.nomeSelecionado]}>
                  {opcao === 'aluno' ? 'Aluno' : 'Funcionário'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Campo rotulo="E-mail" valor={email} aoAlterar={definirEmail} exemplo="Seu e-mail" teclado="email-address" limite={254} capitalizacao="none" corrigir={false} editavel={!ocupado} />
          <Campo rotulo="Senha" valor={senha} aoAlterar={definirSenha} exemplo="Sua senha" limite={128} ocultar capitalizacao="none" corrigir={false} editavel={!ocupado} />
          {erro ? <Text accessibilityRole="alert" style={estilos.descricao}>{erro}</Text> : null}
          <Botao titulo={ocupado ? 'Entrando...' : 'Entrar'} desabilitado={ocupado} aoPressionar={enviar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flexGrow: 1, justifyContent: 'center' },
  conteudo: { padding: 28, gap: 20, width: '100%', maxWidth: 480, alignSelf: 'center' },
  titulo: { color: cores.texto, fontSize: 34, fontWeight: '700' },
  descricao: { color: cores.secundario, fontSize: 15, lineHeight: 22 },
  perfis: { flexDirection: 'row', gap: 12 },
  perfil: { flex: 1, borderRadius: 8, backgroundColor: cores.superficie, padding: 15, alignItems: 'center' },
  selecionado: { backgroundColor: cores.verde },
  nomePerfil: { color: cores.texto, fontWeight: '600' },
  nomeSelecionado: { color: cores.fundo },
});
