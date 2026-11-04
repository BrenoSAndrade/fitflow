import Tela from '../componentes/Tela';
import Botao from '../componentes/Botao';

export default function Inicio({ navigation: navegacao }) {
  return (
    <Tela titulo="Início" descricao="Seu treino e sua próxima aula ficarão aqui.">
      <Botao titulo="Ver aulas" aoPressionar={() => navegacao.navigate('Aulas')} />
      <Botao titulo="Ver estatísticas" secundario aoPressionar={() => navegacao.navigate('Estatísticas')} />
    </Tela>
  );
}
