# Uso de IA no app

A GS permite IA como copiloto, desde que os prompts fiquem registrados e a gente saiba explicar cada linha. Cada entrada: data, quem usou, ferramenta, o que foi pedido e o que foi aproveitado.

## 15/11/2026 · Arthur · Claude Code

- **Pedido:** README completo do repositório: Ficha da CitizenTech, integrantes, jornada do cidadão, instruções para rodar (com mock e com a API C#), origem de cada dado, tabelas do SQLite, acessibilidade, estrutura de pastas e prints das telas.
- **Aproveitado:** o README inteiro. O link do vídeo fica para a gente colocar.

## 15/11/2026 · Arthur · Claude Code

- **Pedido:** conferir os nomes e os RMs dos integrantes no README e deixar em ordem alfabética.
- **Aproveitado:** a correção do RM do Arthur, que tinha vindo errado e a nova ordem.

## 15/11/2026 · Arthur · Claude Code

- **Pedido:** saber se a lista de bairros do cadastro dependia da API C#; depois, trazer mais bairros de São Paulo e trocar os botões por uma seleção que abre a lista para escolher um.
- **Aproveitado:** a explicação de que a API aceita qualquer bairro, a lista com 38 bairros, a seleção com busca e os lugares simulados dos bairros novos. Nada foi alterado no `luzvital`.

## 15/11/2026 · Arthur · Claude Code

- **Pedido:** com a API C# rodando, verificar se o app está buscando os dados dela
- **Aproveitado:** a conferência (API respondendo, sem alertas ativos), o arquivo `.env` que faltava e a explicação da regra: sem endereço configurado usa o mock; com endereço usa a API e, se ela cair, a cópia guardada no SQLite.

## 15/11/2026 · Arthur · Claude Code

- **Pedido:** ligar a aba "Lugares" ao serviço de pontos com energia feito na entrega de SOA (C#), sem quebrar o que já funcionava com o mock.
- **Aproveitado:** a busca em `GET /api/pontos` quando `EXPO_PUBLIC_PONTOS_URL` está definida (com o mock de reserva se o serviço não responder), a linha "Como está agora" no detalhe do lugar, a variável nova no `.env.example` e a atualização do README. Os ids continuam `p1`, `p2`..., então os lugares já salvos seguem valendo.

## 15/11/2026 · Arthur · Claude Code

- **Pedido:** colocar no README o link do repositório do serviço de pontos e deixar o README mais curto.
- **Aproveitado:** o link e o README mais enxuto: as instruções das duas APIs viraram uma tabela, e saíram a árvore de pastas e os comandos de verificação. A ficha, a jornada, o banco, a acessibilidade e os prints continuam.
