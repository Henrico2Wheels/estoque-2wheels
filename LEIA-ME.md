# Estoque 2Wheels

Controle de estoque com lançamento por unidade, caixa com quantidade ou caixa cheia, e mensagem pronta para o grupo de controle no WhatsApp.

## Onde abrir

| Versão | Link | Para quê |
|---|---|---|
| **Compartilhada** (Artifact) | https://claude.ai/code/artifact/f9c295c4-e95d-4a50-abdc-13ec7da30427 | Uso real: o saldo é o mesmo para todo mundo que abrir, em tempo real. Precisa de conta Claude e o link precisa ser compartilhado pelo menu da página. |
| **Pública** (site) | https://henrico2wheels.github.io/estoque-2wheels/ | Mostrar para outras pessoas testarem sem conta nenhuma. Cada pessoa fica com um estoque só dela, no próprio aparelho. |
| **Arquivo** | `Estoque-2Wheels.html` (nesta pasta) | Abrir sem internet, com dois cliques. Mesmo comportamento da versão pública. |

Repositório do site: https://github.com/Henrico2Wheels/estoque-2wheels — o site é o arquivo `index.html`; para atualizar, é só subir um `index.html` novo por cima.

## As quatro abas

**Lançar** — escolhe Saída, Entrada ou Ajuste, o motivo e o canal, busca o produto e toca nele. Abre a tela de quantidade; a lista de produtos some. Dá para somar vários itens antes de confirmar.

**Estoque** — saldo de cada produto, filtro por linha, e o botão "Enviar estoque" que gera a mensagem do estoque inteiro ou só do que está zerado / abaixo do mínimo.

**Histórico** — todos os lançamentos, com estorno (nada é apagado) e reenvio da mensagem.

**Contagem** — conta uma linha por vez, em caixas cheias e unidades. Campo vazio quer dizer "não contei", e o saldo daquele item não muda.

## As três formas de contar quantidade

1. **Unidades soltas** — frascos avulsos.
2. **Caixas com quantidade** — você digita quantas unidades tem naquela caixa. O app nunca sugere esse número; ele só lembra o último que alguém digitou para o mesmo produto.
3. **Caixas cheias** — a caixa padrão de estoque, fechada, sem contar por dentro. Vira uma unidade de estoque própria: o saldo aparece como "12 un + 3 cx".

Se você ainda não sabe quantas unidades cabem na caixa padrão, **deixe em branco**. O app continua contando as caixas cheias à parte. Quando levantar esse número, preencha em Ajustes › Unidades por caixa (dá para preencher a linha inteira de uma vez) ou na ficha do produto. A partir daí ele passa a somar tudo em unidades nos totais.

Quando abrir uma caixa fechada, use "Abrir 1 caixa cheia" na ficha do produto: tira uma caixa e soma as unidades que tinham dentro, e oferece gravar esse número como padrão.

## A mensagem do WhatsApp

Depois de cada lançamento aparecem quatro opções: só a movimentação, movimentação + saldo (padrão), estoque completo e só zerados/abaixo do mínimo. Os botões são WhatsApp (abre o app com o texto pronto e você escolhe o grupo), Copiar e Compartilhar.

O estoque completo tem cerca de 2.700 caracteres e 70 linhas. Nesse tamanho, use **Copiar** e cole no grupo — o botão do WhatsApp pode cortar textos longos.

## Catálogo

154 produtos e 19 kits, montados a partir da loja Tray (`web_api`), da tabela B2B 2026 e do cadastro GS1 de códigos de barras. Kits dão baixa nos componentes. Os 18 itens que só existem na tabela de lojista (galões de 20 L e versões tampa lacre) começam ocultos e aparecem com o botão no fim da aba Estoque.

Dois kits ficam marcados como "composição a confirmar" (Lubrificação Tempo Úmido e Mecânico Abastecido) e não podem ser lançados até você conferir a composição em Ajustes › Kits.

## Pendências que dependem de você

- Produto 19 da Tray (Roof antigo) está **ativo e visível** na loja com preço maior que o Roof atual: R$ 32,50 e R$ 63,00 contra R$ 27,72 e R$ 53,81. Vale desativar.
- Produto 75 (Fork Oil 10W antigo) está comprável por link direto, mesmo fora da vitrine.
- Finish 200/500/60 ml estão com o código de barras do All Clean Dry 500 ml na Tray; Duc Decap Gel 200 ml está com o código do 1 litro.
- A planilha de códigos de barras perdeu o código do Soft (célula A48): o número certo é 7898070381272.
- All Clean Citrus 1 L e All Clean Premium 1 L têm dois códigos de barras válidos no cadastro. Confirme qual está impresso no rótulo.

## Para regerar o app

Dentro de `kit/`:

```bash
node build_catalogo.js && node build_embed.js && node build_app.js && node build_public.js
```

`app.template.html` é o arquivo que se edita. Os outros são gerados.
