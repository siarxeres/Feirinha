# Feirinha — Estratégia & Modelo de Negócio

> Documento **estratégico**, separado do README técnico. Reúne as hipóteses de
> modelo de negócio, a análise de parceria de pagamento e o roteiro de pesquisa
> de campo. **Nada aqui é decisão fechada nem roadmap** — é material de trabalho
> para validar em campo antes de virar código. Pode ser mantido fora do Git.
>
> Última consolidação: jul/2026.

---

## Diagnóstico do modelo atual

Modelo inicial: **SaaS** — feirante paga R$ 29,90/mês.

Ordem de grandeza:
- ~700 mil feirantes no Brasil (estimativa grosseira).
- 1% de penetração → ~R$ 2,5 mi/ano.
- 5% (irreal) → ~R$ 12,5 mi/ano.

Somado a churn alto (público volátil), que derruba o valor de cada cliente ao
longo da vida e limita o custo de aquisição — inviabilizando anúncio pago.

**Conclusão:** sustenta um negócio pequeno (estilo de vida). Não escala como
negócio de investidor. → O modelo de assinatura foi **abandonado** em favor da
tese abaixo.

---

## Tese principal (Hipótese 1) — Organizador grátis; digitalizar o dinheiro que JÁ corre na feira

Versão mais madura da monetização. Raciocínio completo:

**O organizador é o gargalo.** Ele decide quem entra na feira. Se adota o
Feirinha, os feirantes vêm por necessidade, não por convencimento. Resolve os
três lados do marketplace de uma vez.

**O organizador NÃO paga nada.** Cobrar dele cria atrito no ponto onde mais se
precisa de adesão. De graça, ele vira *vendedor* do app — empurra os feirantes
pra dentro, porque a vida dele só melhora quando todos estão cadastrados. Isso
resolve a aquisição: não se adquire feirante (caro e disperso); o organizador
entrega em bloco, de graça.

**⚠️ Cadastrado ≠ pagante.** O organizador quer o feirante *cadastrado* (gerir
presença, vaga, recado). Nada nessa cadeia, por si só, faz o feirante *pagar*.
É preciso amarrar o pagamento a algo que o feirante precisa (a vaga, a
presença) — e isso depende do organizador topar ser o ponto de cobrança.

**A virada de chave (o que torna tudo viável):** o feirante JÁ PAGA hoje —
mensalidade ao organizador + rateio operacional (mesa, cadeira, energia). Tudo
manual (caderno, dinheiro vivo, WhatsApp). A pergunta deixa de ser *"como crio
uma cobrança nova?"* (difícil) e passa a ser *"como digitalizo uma cobrança que
já existe?"* (fácil). Não se cria custo — digitaliza-se um que já sai do bolso
do feirante.

**Por que é forte:**
- Não compete com a maquininha do feirante (as vendas dele continuam como estão).
- O organizador é parte interessada: hoje sofre com inadimplência e caderno. App
  que cobra automático e repassa organizado **elimina a dor de cobrança dele**.
- O Feirinha fica no trilho de um pagamento que já acontece (feirante →
  organizador). GMV mais fácil de capturar primeiro, antes do GMV das vendas.

**Riscos a vigiar:**
- **Hábito/confiança.** O feirante paga na mão do organizador que conhece há anos.
  Migrar pro app só destrava se o organizador disser "agora é pelo app" e parar
  de aceitar dinheiro na mão.
- **Sensibilidade redobrada.** Estar no meio da mensalidade = estar no meio do
  sustento do organizador. Se o repasse falha/atrasa, mexe-se no bolso da pessoa
  mais importante do ecossistema. Barra de confiabilidade muito alta.

**Sobre o preço (R$ 10/feira vs mensalidade):** cobrar "por feira" mata o churn —
só cobra quando o feirante trabalha, transformando custo fixo em variável ligado
ao uso. Cuidado: feirante muito ativo (8-12 feiras/mês) pode achar caro vs.
mensalidade fixa; considerar teto mensal para proteger o melhor cliente. Número
de feiras/mês do feirante médio de Porto Velho é desconhecido — pergunta de campo.

> **Nota histórica:** decisão anterior (jun/2026) apontava o inverso — assinatura
> paga pelo *organizador* + taxa sobre inscrição. A tese atual (organizador
> grátis, feirante paga) é mudança consciente, não continuidade.

---

## Hipótese 2 — O valor está no fluxo transacional, não na assinatura

Uma feira média (50 feirantes, ~R$ 1.500/dia cada, 4 feiras/mês) movimenta
~R$ 300 mil/mês de GMV.

| Feiras | GMV/mês | Take de 1% | Receita/ano |
|---|---|---|---|
| 100 | R$ 30 mi | R$ 300 mil | R$ 3,6 mi |
| 1.000 | R$ 300 mi | R$ 3 mi | R$ 36 mi |
| 5.000 | R$ 1,5 bi | R$ 15 mi | R$ 180 mi |

A taxa sobre pagamento supera a assinatura **e cresce sozinha** conforme o
feirante vende mais. Incentivo alinhado: o Feirinha ganha quando o feirante ganha.

---

## Hipótese 3 — Crédito é onde está a margem

Quem processa o pagamento **enxerga o faturamento real** do feirante. Feirante é
desbancarizado, não comprova renda, não acessa crédito. Com histórico de
faturamento + agenda futura de feiras, o risco cai muito. Margem de crédito é
ordens de grandeza maior que a de software.

**Sequência hipotética:** software barato/grátis → conquista o organizador →
organizador traz os feirantes → feirantes usam o meio de pagamento → dados de
faturamento → crédito. *O software é o cavalo de Troia, não o produto.*

---

## Meio de pagamento e o Asaas Tap

**O que é:** tap-to-phone transforma celular Android com NFC em maquininha. Sem
hardware, sem logística, sem comodato.

**Por que importa:** elimina a maior fricção de qualquer adquirente. Permite
ativar feirante remotamente e de graça — viável para operação enxuta / solo.

**Mas atenção — não é diferencial:** tap-to-phone é commodity (Asaas, Mercado
Pago, InfinitePay, PagBank, Stone, todos têm). Não vender como inovação.

**O diferencial real é o contexto:** o Mercado Pago sabe que o feirante vendeu
R$ 40. O Feirinha saberia que ele vendeu R$ 40 *na Feira do Produtor, domingo,
barraca 12, categoria hortifruti* — e quanto a feira inteira movimentou. Isso
habilita crédito, antecipação, ranking, repasse automático ao organizador e
dados de gestão. **O tap viabiliza; o contexto da feira é o que defende.**

**Limitações a verificar em campo:**
- Só funciona em Android com NFC — o celular do feirante médio tem?
- O feirante já usa maquininha. Por que trocaria? Se for só "taxa menor", é guerra
  perdida contra quem tem mais capital.

---

## Parceria com operador de maquininhas

Perfil do parceiro atual: **operação regional** (carteira local, relacionamento
de rua, tipo 3). Ele tem mais poder de barganha hoje — Feirinha é pré-lançamento.

**A dor dele que o Feirinha resolve:** aquisição braçal (vendedor um a um), churn
brutal (troca por 0,2% a menos), hardware como prejuízo, competição só por preço.

**O pitch:** "Eu te entrego a feira inteira de uma vez — o organizador manda o
link, 50 feirantes ativam no mesmo dia, sem visita e sem hardware. E esses
clientes não vão embora, porque a maquininha está amarrada ao sistema que ele usa
pra trabalhar." Aquisição em bloco + retenção estrutural — o que ele não compra.

**Três cláusulas inegociáveis (senão você constrói o negócio dele de graça):**

| Cláusula | Por quê |
|---|---|
| **Split na origem** | Feirinha fica com uma fatia de cada transação, automaticamente no momento da venda — não comissão paga depois. |
| **Acesso aos dados** | Ver o faturamento dos próprios feirantes. Sem isso, não há crédito futuro. |
| **Não-concorrência** | Ele não pode pegar a base e montar o próprio app de feiras. |

**Duas perguntas técnicas que decidem tudo:**
1. Ele consegue fazer **split de pagamento**? Sem isso, a parceria é inviável do
   jeito que precisa ser.
2. Ele tem **tap-to-phone**? Se só vende hardware, é parte do problema.

**Distância geográfica NÃO é proteção.** Software não tem fronteira; um parceiro
distante copia o modelo na semana seguinte. O que protege é contrato (as três
cláusulas). E o ativo do parceiro regional — estar aqui, conhecer os
organizadores — é exatamente o que falta ao Feirinha. Trocar distribuição local
por "segurança" geográfica ilusória é mau negócio.

**Decisão consciente: não escolher parceiro ainda.** Sem usuário e sem validação,
não há poder de barganha — qualquer parceiro dita as regras. Primeiro validar em
campo e conseguir um organizador; depois negociar (idealmente com 2-3 opções
concorrendo: o regional, o Asaas, um terceiro).

---

## Pesquisa de campo — o que validar ANTES de tocar em pagamento

**Regra de ouro:** você não está vendendo, está investigando. Não fale do app nos
primeiros 15 minutos. Deixe o organizador contar a dor.

### Perguntas para organizadores
1. Como funciona hoje a inscrição de um feirante, do início ao fim?
2. Quanto tempo isso toma por semana? O que deixa de fazer por causa disso?
3. Qual foi a última vez que deu problema? (história concreta, não opinião)
4. Quem deveria pagar por uma solução — você ou o feirante? *(perguntar e ficar em silêncio)*
5. Toparia testar na próxima edição da sua feira? *(única pergunta de compromisso — "me manda material" = não)*
6. **[DECISIVA — cobrança]** Como você cobra hoje a mensalidade e o rateio de
   mesa/cadeira/energia? Quanta gente atrasa ou some sem pagar? Quanto do seu
   tempo isso toma? → "É um inferno, corro atrás todo mês, controlo no caderno" =
   achou a dor que vende o app sozinho.
7. **[DECISIVA — ponto de cobrança]** Se o app fosse grátis pra você e resolvesse
   presença, taxa e comunicação — você toparia que a vaga do feirante só valesse
   depois que ele pagasse uma taxinha pelo próprio app? → A cara que ele fizer diz
   se o Feirinha tem modelo de negócio ou só um bom produto de gestão gratuito.

### Perguntas para feirantes
8. Quantas feiras você faz por mês? *(define se R$ 10/feira é barato ou caro)*
9. Tem Android com NFC?
10. Já usa maquininha? Qual? Quanto paga de taxa?
11. O que te faria trocar?
12. O organizador ganha comissão sobre suas vendas?

### Perguntas-bônus (se fluir)
- Conhece outros organizadores com o mesmo problema? → **peça indicação, sempre.**
- Quantos feirantes tem? Quantos entram/saem por mês? → dimensiona o mercado.
- A prefeitura te pede algo (lista, relatório, cadastro)? → dor escondida possível.

### Registro pós-conversa (5 min, antes de esfriar)
1. Nome, feira, nº de feirantes.
2. Frase exata mais dolorosa que ele disse (aspas, palavras dele).
3. Quem ele acha que deveria pagar.
4. Topou testar? Sim/Não (deu o contato?).
5. Indicou alguém?

**Meta:** 5 organizadores em Porto Velho / 2 semanas. Se 3 dos 5 repetirem a
mesma dor, achou o produto. Se cada um disser algo diferente, ainda não achou.

---

## Princípio de governança de pagamento

Qualquer código ou mudança de arquitetura relacionada a pagamento (Asaas, PIX,
split, cobrança, webhook, repasse) é **categoria protegida**: exige discussão
explícita antes de implementar. Sem implementação silenciosa.
