# AGENTS.md

## Objetivo do projeto

Criar um sistema web de Pick'em da Copa do Mundo para uso casual entre amigos.

O projeto deve ser funcional, simples e barato de manter. Não é necessário criar uma arquitetura enterprise. Priorizar um MVP bem feito, fácil de entender e fácil de evoluir.

## Escopo atual do MVP

O foco inicial do MVP é a experiência de picks do usuário logado.

Implementar primeiro:

* login por magic link com Supabase Auth
* criação obrigatória de nickname único
* tela de picks com as 48 seleções da Copa do Mundo 2026 agrupadas por grupo
* seleção de picks no formato 6/10/6
* validação server-side dos picks
* confirmação final com resumo e checkbox
* salvamento único e irreversível dos picks
* tela travada para o usuário rever seus picks depois do envio

Deixar para depois:

* ranking
* admin
* cadastro/edição de resultados
* cálculo de pontuação
* painel para editar times e grupos

Essas funcionalidades continuam previstas, mas não fazem parte da primeira entrega.

## Stack obrigatória

Use:

* Next.js com App Router
* TypeScript
* Supabase
* PostgreSQL via Supabase
* Supabase Auth
* Tailwind CSS
* Deploy esperado na Vercel

Não criar backend separado. Toda a lógica deve ficar no próprio Next.js, preferencialmente usando Server Actions ou Route Handlers quando houver validação sensível.

## Conceito do jogo

O jogo é inspirado no Pick'em de CS.

Cada usuário deve escolher exatamente 22 seleções:

* 6 seleções que terminarão a fase de grupos em primeiro lugar
* 10 seleções que passarão de fase, mas não serão líderes do grupo
* 6 seleções que serão eliminadas na fase de grupos

Cada seleção só pode ser escolhida uma vez por usuário. Uma seleção não pode aparecer em mais de uma categoria.

Cada pick correto vale 1 ponto.

Pontuação máxima: 22 pontos.

## Tipos de pick

Usar os seguintes tipos internamente:

```ts
type PickType = "GROUP_WINNER" | "QUALIFIED_NOT_WINNER" | "ELIMINATED";
```

Regras de acerto:

* `GROUP_WINNER`: acerta se a seleção terminar em 1º no grupo.
* `QUALIFIED_NOT_WINNER`: acerta se a seleção passar de fase, mas não terminar em 1º. Isso inclui segundos colocados e melhores terceiros classificados.
* `ELIMINATED`: acerta se a seleção não passar da fase de grupos.

## Regras de negócio do MVP

Implementar as seguintes regras:

1. Usuário precisa estar autenticado para fazer picks.
2. Usuário precisa ter um nickname único antes de acessar ou enviar picks.
3. Qualquer pessoa com email válido pode entrar no bolão.
4. Login deve usar magic link com Supabase Auth.
5. Cada usuário só pode enviar picks uma vez.
6. Depois de enviados, os picks não podem ser alterados.
7. Antes de enviar, o usuário deve ver um modal de confirmação com resumo dos picks e marcar um checkbox confirmando que entende que o envio é definitivo.
8. Cada conjunto deve ter exatamente:

   * 6 picks `GROUP_WINNER`
   * 10 picks `QUALIFIED_NOT_WINNER`
   * 6 picks `ELIMINATED`

9. Não permitir seleção repetida no mesmo conjunto de picks.
10. Não validar coerência por grupo no MVP. O sistema pode permitir, por exemplo, mais de um líder escolhido no mesmo grupo. A única validação de repetição é por seleção.
11. Picks podem ser enviados apenas enquanto o jogo estiver aberto.
12. O prazo de bloqueio dos picks deve vir de variável de ambiente.
13. Depois do prazo de bloqueio, usuários que ainda não enviaram não podem enviar picks.
14. Usuários que já enviaram continuam podendo rever seus picks.

## Prazo de bloqueio

Usar variável de ambiente:

```env
PICKS_LOCKED_AT=2026-06-11T18:00:00.000Z
```

Formato obrigatório: ISO UTC.

Na UI, exibir o prazo em horário de Brasília.

Exemplo de microcopy:

```txt
Envios abertos até 11/06/2026, 15:00 BRT
```

## Fluxo de autenticação e perfil

1. Usuário acessa login.
2. Usuário informa email.
3. Supabase envia magic link.
4. Após autenticação, se o usuário ainda não tiver nickname, ele deve criar um nickname único.
5. Somente depois disso o usuário pode montar os picks.

O nickname será a identidade pública do usuário no bolão e no ranking futuro.

## Fluxo de picks

1. Usuário acessa `/picks`.
2. Se ainda não enviou picks e o prazo está aberto, entra em modo montagem.
3. Usuário escolhe uma categoria ativa:

   * Líderes de grupo
   * Classificados
   * Eliminados

4. Usuário clica nas seleções dos grupos para adicionar à categoria ativa.
5. Quando a categoria atinge o limite, novos picks nessa categoria ficam bloqueados até remover uma seleção.
6. Se a seleção já estiver em outra categoria, ela fica bloqueada. Para mover, o usuário precisa remover antes e adicionar de novo na outra categoria.
7. Usuário pode remover uma seleção:

   * clicando no card da seleção já escolhida na lista de grupos
   * clicando no botão de remover dentro do card da categoria

8. Botão de salvar só fica disponível quando o usuário completar 22/22 picks.
9. Ao clicar em salvar, abrir modal com resumo dos 22 picks por categoria.
10. O usuário precisa marcar um checkbox confirmando que entende que os picks são definitivos.
11. Ao confirmar, os 22 picks são gravados no banco em uma única submissão.
12. Depois de enviado, `/picks` mostra modo travado/resumo, sem botões de edição.

## Telas obrigatórias do MVP

### Página inicial

Rota: `/`

Deve conter:

* nome do jogo
* explicação rápida das regras
* botão para login
* botão para ir para picks
* status do jogo:

  * aberto para picks
  * picks bloqueados

### Login

Rota: `/login`

Usar Supabase Auth com magic link.

### Perfil/Nickname

Rota sugerida: `/profile` ou etapa equivalente após login.

Deve conter:

* campo para nickname
* validação de nickname obrigatório
* validação de nickname único
* mensagem clara se o nickname já estiver em uso

### Tela de picks

Rota: `/picks`

Deve conter:

* lista das 48 seleções da Copa 2026 agrupadas por grupo
* seletor de categoria ativa
* área para 6 seleções líderes de grupo
* área para 10 seleções classificadas sem serem líderes
* área para 6 seleções eliminadas
* contador de picks selecionados por categoria
* contador total 22/22
* botão de salvar
* validação visual quando faltar pick
* bloqueio visual se o prazo já tiver passado
* confirmação final com resumo e checkbox
* picks já enviados em modo travado/resumo ao entrar na tela

Interface de picks:

* não usar drag-and-drop no MVP
* usar seleção por categoria ativa
* três cards de categoria clicáveis funcionam como seletor e resumo
* no mobile, o seletor/resumo de categorias deve ficar sticky no topo em versão compacta
* grupos devem aparecer em cards, com 4 seleções por grupo

### Ranking

Rota futura: `/ranking`

Não faz parte do MVP inicial.

Quando implementado, deve conter:

* posição
* nickname do usuário
* pontuação total
* quantidade de acertos
* data de envio dos picks

Opcional:

* ao clicar em um usuário, mostrar os picks dele

### Admin

Rota futura: `/admin`

Não faz parte do MVP inicial.

Quando implementado, deve ser uma página simples protegida por lista de emails admins ou flag `is_admin`.

Deve conter futuramente:

* cadastro/edição de seleções
* cadastro/edição dos grupos
* cadastro/edição do status final da fase de grupos
* botão para recalcular pontuações

Não criar painel complexo. Pode ser simples e funcional.

## Modelo de banco sugerido

Criar migrations SQL para Supabase.

### profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
```

### teams

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  group_name text not null,
  flag_emoji text,
  created_at timestamptz not null default now()
);
```

Os nomes das seleções devem ser curtos e familiares em português.

Exemplos:

* EUA
* Coreia do Sul
* Tchéquia
* RD Congo
* Costa do Marfim
* Arábia Saudita
* Cabo Verde

### pick_submissions

```sql
create table pick_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique(user_id)
);
```

### picks

```sql
create table picks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references pick_submissions(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  pick_type text not null check (
    pick_type in ('GROUP_WINNER', 'QUALIFIED_NOT_WINNER', 'ELIMINATED')
  ),
  created_at timestamptz not null default now(),
  unique(submission_id, team_id)
);
```

### team_results

Tabela futura para ranking e pontuação.

```sql
create table team_results (
  team_id uuid primary key references teams(id) on delete cascade,
  group_position int,
  qualified boolean not null default false,
  updated_at timestamptz not null default now()
);
```

### pick_scores

Tabela futura para ranking e pontuação.

```sql
create table pick_scores (
  pick_id uuid primary key references picks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_correct boolean not null default false,
  points int not null default 0,
  calculated_at timestamptz not null default now()
);
```

## RLS e segurança

Ativar Row Level Security nas tabelas sensíveis.

Regras esperadas no MVP:

* usuário só pode ver seu próprio profile completo
* usuário autenticado pode criar seu profile/nickname uma vez
* nickname deve ser único no banco
* usuário só pode ver seus próprios picks e sua própria submissão
* usuário só pode inserir uma submissão se ainda não tiver enviado e o prazo estiver aberto, com validação server-side
* ninguém deve alterar picks depois de enviados
* todos os usuários autenticados podem ler `teams`
* não expor `service_role` no client
* usar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no client
* usar chave privada apenas em código server-side, se necessário

Regras futuras:

* usuário pode ver ranking e resultados publicados
* apenas admin pode alterar times, resultados e configurações

## Validações obrigatórias no servidor

Não confiar apenas na UI.

Ao salvar picks, validar no servidor:

* usuário autenticado
* usuário tem nickname
* jogo ainda aberto
* usuário ainda não enviou picks
* exatamente 22 picks
* exatamente 6 `GROUP_WINNER`
* exatamente 10 `QUALIFIED_NOT_WINNER`
* exatamente 6 `ELIMINATED`
* nenhum time repetido
* todos os times existem

Também garantir no banco:

* `unique(user_id)` em `pick_submissions`
* `unique(submission_id, team_id)` em `picks`

## Cálculo de pontuação futuro

Criar função server-side para recalcular pontuação quando ranking/resultados entrarem no escopo.

Lógica:

```ts
if (pick_type === "GROUP_WINNER") {
  correct = result.group_position === 1;
}

if (pick_type === "QUALIFIED_NOT_WINNER") {
  correct = result.qualified === true && result.group_position !== 1;
}

if (pick_type === "ELIMINATED") {
  correct = result.qualified === false;
}
```

Se correto:

```ts
points = 1;
```

Se errado:

```ts
points = 0;
```

## Design

Visual inspirado em Pick'em de CS, com tema escuro, competitivo e minimalista.

Usar:

* fundo escuro
* cards para categorias
* grupos em cards
* seleções em cards limpos
* contador por categoria
* feedback visual para categoria completa
* tela travada/resumo bonita o suficiente para print/compartilhamento

Não perder muito tempo com animações. Priorizar funcionalidade, clareza e polimento.

## Estrutura de pastas sugerida

```txt
src/
  app/
    page.tsx
    login/
    profile/
    picks/
    ranking/
    admin/
  components/
    TeamCard.tsx
    PickCategory.tsx
    PickSummary.tsx
  lib/
    supabase/
      client.ts
      server.ts
    picks/
      validation.ts
      scoring.ts
      constants.ts
  actions/
    picks.ts
    profile.ts
    admin.ts
  types/
    database.ts
    picks.ts
supabase/
  migrations/
  seed.sql
```

## Padrões de código

* Usar TypeScript estrito.
* Evitar `any`.
* Separar validações em funções reutilizáveis.
* Centralizar limites de picks em constantes reutilizáveis.
* Preferir nomes claros.
* Componentes pequenos.
* Lógica de banco e validação não deve ficar misturada em componentes visuais.
* Server Actions devem retornar mensagens claras de erro.
* Não duplicar regra de negócio em vários lugares sem necessidade.

## Comandos esperados

Ao implementar, garantir que estes comandos funcionem:

```bash
npm install
npm run dev
npm run lint
npm run build
```

Se criar testes:

```bash
npm run test
```

## Seed inicial

Criar seed ou migration simples para popular as 48 seleções da Copa do Mundo 2026.

Dados esperados por seleção:

* nome curto em português
* código FIFA
* grupo
* emoji de bandeira

As seleções devem ser exibidas agrupadas por Grupo A até Grupo L.

Não hardcodar a lista apenas na UI. Os times devem vir do banco para permitir ajustes futuros.

## Identidade visual

O projeto deve ter uma identidade visual inspirada em jogos competitivos, especialmente Pick'em de CS, mas adaptada para Copa do Mundo.

A interface deve parecer um painel de torneio competitivo: escuro, moderno, esportivo, minimalista e levemente gamer, sem parecer infantil.

## Direção visual

Usar como referência:

* Pick'em de Counter-Strike
* Fantasy esportivo
* Dashboard de torneio
* Cards de times/seleções
* Ranking competitivo futuramente

A UI deve transmitir:

* competição
* previsão/palpite
* fase de grupos
* bolão entre amigos
* visual de campeonato

## Tema

Usar tema escuro como padrão.

Cores principais:

```txt
Background principal: #020617
Background secundário: #0F172A
Cards: #111827
Cards destacados: #1E293B
Bordas: #334155
Texto principal: #E5E7EB
Texto secundário: #94A3B8
Texto apagado: #64748B
```

Cores de destaque:

```txt
Azul competitivo: #38BDF8
Verde acerto: #22C55E
Vermelho erro: #EF4444
Amarelo/ouro ranking: #FACC15
Roxo destaque: #8B5CF6
```

## Uso das cores

* Azul deve ser usado para ações principais, links e estados ativos.
* Verde deve indicar categoria completa, sucesso ou pick correto futuramente.
* Vermelho deve indicar erro, pick incorreto ou validação inválida.
* Amarelo/ouro deve ser reservado para ranking, badges ou destaque de campeão futuramente.
* Roxo pode ser usado como cor complementar para detalhes visuais.

Evitar muitas cores ao mesmo tempo. A interface deve continuar sóbria.

## Tipografia

Usar fonte sem serifa, moderna e legível.

Preferência:

* Inter
* Geist
* system-ui

Títulos podem ter peso forte, entre `font-bold` e `font-black`.

Usar títulos em caixa alta em áreas competitivas, como:

* MEUS PICKS
* LÍDERES DE GRUPO
* CLASSIFICADOS
* ELIMINADOS

Não usar fontes muito decorativas.

## Layout geral

A aplicação deve ter largura máxima centralizada.

Usar:

```txt
max-w-6xl
mx-auto
px-4
py-6
```

Em telas grandes, a tela de picks deve destacar:

* cards de categoria clicáveis como seletor e resumo
* grupos em cards
* lista de seleções organizada por Grupo A-L

Em telas pequenas:

* empilhar o conteúdo verticalmente
* manter seletor/resumo de categorias sticky no topo em versão compacta

## Componentes principais

### TeamCard

Card de seleção.

Deve conter:

* emoji de bandeira
* nome curto da seleção
* código curto opcional
* estado selecionado
* estado indisponível
* hover visual

Visual esperado:

```txt
fundo escuro
borda sutil
border-radius grande
hover com borda azul
selecionado com borda verde ou azul
limpo e minimalista
```

### PickCategory

Card de categoria.

Deve conter:

* título da categoria
* descrição curta
* contador, exemplo: 2/6
* lista de seleções escolhidas
* estado ativo
* estado completo
* estado incompleto

Quando completo, mostrar detalhe verde discreto.

### PickSummary

Resumo travado após envio.

Deve conter:

* nickname do usuário
* data de envio
* categorias com picks escolhidos
* visual bom para print/compartilhamento
* nenhum controle de edição

### RankingTable

Componente futuro.

Quando implementado, deve destacar:

* primeiro lugar com cor ouro
* segundo e terceiro com destaque discreto
* usuário atual com borda ou background diferente

## Estilo dos cards

Cards devem usar:

```txt
rounded-2xl
border
shadow
bg-slate-900
border-slate-700
```

Estados de hover:

```txt
hover:border-sky-400
hover:bg-slate-800
transition
```

Estados selecionados:

```txt
border-sky-400
bg-sky-950/40
```

Estados completos:

```txt
border-green-500
```

Estados de erro:

```txt
border-red-500
text-red-400
```

## Botões

Botão primário:

```txt
bg-sky-500
hover:bg-sky-400
text-slate-950
font-bold
rounded-xl
```

Botão secundário:

```txt
bg-slate-800
hover:bg-slate-700
text-slate-100
border
border-slate-600
```

Botão perigoso:

```txt
bg-red-500
hover:bg-red-400
text-white
```

## UX dos picks

A escolha dos picks deve ser simples.

Não implementar drag-and-drop no MVP.

Fluxo recomendado:

1. Usuário seleciona a categoria ativa.
2. Usuário clica em uma seleção.
3. A seleção aparece naquela categoria.
4. Usuário pode remover a seleção.
5. Para trocar de categoria, remove antes e adiciona de novo.

Mostrar sempre o progresso:

```txt
6/6 Líderes
10/10 Classificados
6/6 Eliminados
22/22 Picks totais
```

Quando os 22 picks estiverem completos, destacar botão de salvar.

## Header

Criar header simples com:

* nome do projeto
* link para Picks
* link para Ranking futuramente
* Admin futuramente, se usuário for admin
* perfil/login/logout

Nome sugerido do projeto:

```txt
Bolão Pick'em Copa
```

## Microcopy

Usar textos curtos e diretos.

Exemplos:

```txt
Escolha suas seleções
Monte seus 22 palpites antes do início da fase de grupos.
```

```txt
Picks bloqueados
A fase já começou. Agora é só torcer.
```

```txt
Envio definitivo
Depois de salvar, seus picks não poderão ser alterados.
```

```txt
Meus picks
Estes foram os seus palpites enviados.
```

## O que evitar no design

Evitar:

* layout branco/claro
* visual muito corporativo
* excesso de gradientes
* animações pesadas
* drag-and-drop obrigatório
* componentes complexos sem necessidade
* tabelas difíceis de ler no mobile
* textos longos na interface

## Qualidade esperada

A interface deve parecer simples, mas polida.

Priorizar:

* consistência visual
* minimalismo
* responsividade
* clareza das regras
* bom espaçamento
* cards bem alinhados
* estados visuais claros
* submissão segura no servidor

## Critérios de aceite do MVP atual

A implementação inicial estará pronta quando:

1. Usuário conseguir logar por magic link.
2. Usuário conseguir criar um nickname único.
3. Usuário só conseguir acessar o fluxo de picks depois de ter nickname.
4. Usuário conseguir ver as 48 seleções da Copa 2026 agrupadas por grupo.
5. Usuário conseguir escolher 22 picks respeitando as categorias 6/10/6.
6. Sistema impedir seleções repetidas.
7. Sistema impedir salvar picks incompletos.
8. Sistema impedir salvar se o prazo estiver bloqueado.
9. Sistema impedir segundo envio do mesmo usuário.
10. Usuário ver modal de confirmação com resumo e checkbox antes do envio definitivo.
11. Depois de enviar, usuário conseguir rever os picks em tela travada/resumo.
12. Projeto rodar localmente.
13. Projeto estar pronto para deploy na Vercel.

## Critérios futuros

Funcionalidades posteriores estarão prontas quando:

1. Admin conseguir cadastrar resultados.
2. Sistema conseguir calcular acertos.
3. Ranking exibir usuários ordenados por pontuação.
4. Em caso de empate, ranking ordenar por data de envio dos picks mais antiga.

## O que evitar

* Não criar backend separado.
* Não usar banco local se Supabase já estiver configurado.
* Não implementar pagamentos.
* Não implementar múltiplas competições agora.
* Não implementar chaveamento de mata-mata agora.
* Não implementar ranking no MVP inicial.
* Não implementar admin no MVP inicial.
* Não criar complexidade desnecessária.
* Não usar bibliotecas grandes sem necessidade.
* Não deixar regras importantes apenas no frontend.

## Prioridade de implementação

Seguir esta ordem:

1. Criar projeto Next com TypeScript e Tailwind.
2. Configurar Supabase.
3. Criar migrations do MVP.
4. Implementar autenticação por magic link.
5. Implementar criação de nickname único.
6. Implementar seed das 48 seleções.
7. Implementar tela de picks agrupada por grupo.
8. Implementar UX de categoria ativa e seleção 6/10/6.
9. Implementar validações server-side.
10. Implementar envio único e irreversível.
11. Implementar tela travada/resumo dos picks.
12. Refinar UI.
13. Rodar lint e build.

Depois do MVP:

1. Implementar resultados.
2. Implementar cálculo de pontuação.
3. Implementar ranking.
4. Implementar admin simples.

## Observação final

Este é um projeto casual para brincar com amigos, mas deve funcionar de ponta a ponta. Priorizar uma solução simples, segura o suficiente e fácil de dar deploy gratuitamente.
