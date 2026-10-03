# Projeto Fit — Direção Visual

## Abordagens consideradas

### Abordagem 1 — Laboratório Solar
**Very Brief Intro:** Uma identidade dark editorial que trata o treino como um ritual de verão: superfícies de carvão, laranja queimado e tipografia compacta com energia de poster desportivo contemporâneo.
**Probability:** 0.07

### Abordagem 2 — Movimento Brutalista
**Very Brief Intro:** Uma landing page crua e modular, com blocos de alto contraste, grelhas visíveis e linguagem visual inspirada em cartazes de treino independentes.
**Probability:** 0.03

### Abordagem 3 — Clube Atlântico
**Very Brief Intro:** Uma experiência mais leve e aspiracional, com azul-noite, areia e detalhes cítricos, equilibrando performance e sensação de comunidade premium.
**Probability:** 0.08

## Abordagem escolhida — Laboratório Solar

### Design Movement
Neo-editorial desportivo: a precisão visual de uma revista de performance, combinada com a urgência gráfica de cartazes de treino de verão.

### Core Principles
1. **Energia controlada:** o laranja aparece como sinal de ação, não como preenchimento indiscriminado.
2. **Hierarquia de poster:** títulos condensados, números grandes e etiquetas curtas criam leitura rápida e memorável.
3. **Ritmo assimétrico:** composição em dois eixos, com conteúdo e prova visual a alternarem pesos para evitar o layout centrado genérico.
4. **Clareza operacional:** cada interação deve responder de imediato ao que o utilizador pode fazer a seguir.

### Color Philosophy
O fundo quase preto cria concentração e dá ao produto uma presença premium. Cinzas quentes mantêm a interface humana e tátil; o laranja solar (#ff5a1f) funciona como pulso visual para CTAs, estados ativos e dados de performance. O branco é reservado para decisões e mensagens de maior importância.

### Layout Paradigm
Secções em camadas, com uma coluna editorial estreita para contexto e uma coluna principal para ação. O hero usa uma composição dividida: narrativa à esquerda e painel de treino assistido por IA à direita. A secção de benefícios alterna cartões verticais e uma faixa horizontal de métricas. Os preços formam uma sequência de três planos com o plano recomendado a avançar ligeiramente no eixo vertical.

### Signature Elements
- **Linha de calor:** uma linha fina laranja, com pequenas marcações técnicas, que separa momentos da página.
- **Chips de protocolo:** etiquetas monoespaçadas como `IA / 07:30 / CASA` para dar sensação de sistema vivo.
- **Número fantasma:** números de secção gigantes, em baixa opacidade, a ancorar a navegação visual.

### Interaction Philosophy
A interface deve sentir-se como um treinador atento: direta, encorajadora e sem ruído. O utilizador recebe feedback visual imediato ao alternar entre mensal e anual, ao escolher um plano ou ao abrir o menu mobile. CTAs usam linguagem de ação e não prometem resultados impossíveis.

### Animation
Usar entradas rápidas com `transform` e `opacity`, em cascata de 40–60ms por grupo. Cartões elevam-se apenas 4px no hover e ganham uma borda laranja suave. O seletor de faturação desliza o indicador em menos de 220ms. O botão deve reduzir para 97% no estado ativo. Respeitar `prefers-reduced-motion` e remover movimentos não essenciais.

### Typography System
- **Display:** `Barlow Condensed`, pesos 600–800, para headlines, preços e números de secção.
- **Body:** `DM Sans`, pesos 400–700, para leitura, labels e navegação.
- **Technical:** `IBM Plex Mono`, peso 500, para chips, metadados e microcopy de sistema.
- Headlines em sentence case, com tracking ligeiramente negativo; labels sempre em maiúsculas, compactas e com tracking positivo.

### Brand Essence
**Posicionamento:** um treinador de IA para pessoas que querem treinar com consistência em casa ou na academia, sem perder tempo a decidir o que fazer.

**Personalidade:** preciso, energético, próximo.

### Brand Voice
Headlines são fortes e concretas; CTAs são verbos curtos; microcopy reduz ansiedade e explica o próximo passo. Evitar promessas absolutas e frases genéricas.

Exemplo de headline: **"O teu verão começa no próximo treino."**

Exemplo de CTA: **"Montar o meu treino"**

### Wordmark & Logo
Marca gráfica sem texto: um símbolo em forma de `P` modular, composto por duas barras verticais e um arco incompleto, sugerindo postura, progresso e a letra inicial de Projeto. O símbolo deve funcionar em laranja solar sobre fundo transparente e aparecer no cabeçalho e como favicon visível.

### Signature Brand Color
**Laranja Solar — `#ff5a1f`**. Um laranja quente, vivo e ligeiramente avermelhado, suficientemente distinto para ser reconhecido como o pulso da marca contra o carvão.

## Style Decisions
- O site será sempre dark-first, sem alternância de tema nesta primeira versão.
- O plano Médio será a âncora visual da tabela, com o selo **Mais Popular** e um tratamento laranja mais expressivo.
- As imagens serão originais e abstratas, evitando replicar ilustrações de terceiros; o crédito DAREBEE será mantido exatamente no rodapé, conforme solicitado.
