import Tela from '../componentes/Tela';
import Botao from '../componentes/Botao';

export default function GradeAulas({ navigation: navegacao }) {
  return (
    <Tela titulo="Grade de aulas" descricao="Nenhuma aula cadastrada.">
      <Botao titulo="Nova aula" aoPressionar={() => navegacao.navigate('Criar aula')} />
    </Tela>
  );
}
