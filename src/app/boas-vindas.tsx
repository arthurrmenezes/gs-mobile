import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao, Cartao, Linha, Tela, Texto, Titulo } from '../components/ui';
import { cores } from '../tema';

export default function BoasVindas() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <Tela>
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 24 }}>
          <Ionicons name="flash" size={64} color={cores.primaria} accessibilityElementsHidden importantForAccessibility="no" />
          <Titulo tam={30}>Luz Vital</Titulo>
          <Texto tam={19} style={{ textAlign: 'center' }}>
            Aviso antes de faltar luz, para quem depende de energia em casa.
          </Texto>
        </View>

        <Cartao>
          <Linha icone="notifications">
            <Texto>Você fica sabendo antes quando há risco de apagão no seu bairro.</Texto>
          </Linha>
          <Linha icone="location">
            <Texto>Você encontra lugares com energia perto de casa.</Texto>
          </Linha>
          <Linha icone="people">
            <Texto>Você avisa como está e chama ajuda com um toque.</Texto>
          </Linha>
        </Cartao>

        <Botao
          titulo="Começar meu cadastro"
          icone="arrow-forward"
          dica="Abre o formulário de cadastro. Leva cerca de um minuto."
          onPress={() => router.push('/cadastro')}
        />
        <Texto tam={16} cor={cores.textoSuave} style={{ textAlign: 'center' }}>
          Seus dados ficam guardados só neste celular.
        </Texto>
      </Tela>
    </SafeAreaView>
  );
}
