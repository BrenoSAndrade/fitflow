import Tela from '../componentes/Tela';
import Botao from '../componentes/Botao';

export default function CriarAula({ navigation: navegacao }) {
  return (
    <Tela titulo="Criar aula" descricao="O cadastro de nome, instrutor, data, horário e vagas será incluído na próxima etapa.">
      <Botao titulo="Voltar para a grade" secundario aoPressionar={() => navegacao.goBack()} />
    </Tela>
  );
}
