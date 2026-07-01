# 🍼 Laço de Leite — Sistema Hospitalar

> **Torre de controle para banco de leite hospitalar.** > Priorize doações, receptoras, validade, coleta e entrega em um fluxo seguro para a equipe médica.

Este projeto é um protótipo funcional de um painel de gerenciamento hospitalar focado na otimização de bancos de leite humano. Ele resolve o desafio crítico de conectar a oferta (doadoras aptas e lotes em estoque) à demanda urgente (recém-nascidos em UTIs Neonatais), respeitando critérios rígidos de validade, triagem clínica e conformidade com a LGPD.

---

## 🚀 Funcionalidades Principais

* **Autenticação por Perfil Clínico:** Tela de login simulada exigindo CRM ou matrícula e seleção da unidade hospitalar responsável.
* **Painel de KPIs em Tempo Real:** Indicadores visuais que destacam o volume total de leite disponível, lotes próximos do vencimento (até 48 horas) e leite parado sem movimentação.
* **Fila Crítica e Tomada de Decisão:** Algoritmo simulado que destaca a "Melhor decisão agora", cruzando o lote mais crítico com a receptora de maior prioridade clínica.
* **Gestão de Estoque e Cadeia Fria:** Gráficos que indicam o volume/status de validade de cada lote e monitoramento de sensores de temperatura em tempo real (Freezers e Caixas de transporte).
* **Roteirização Inteligente:** Visualização de etapas e mapas operacionais para coletas externas e entregas rápidas na UTI.
* **Trilha de Auditoria:** Registro automatizado (feed de ações) de todas as decisões tomadas pelos profissionais dentro do sistema para fins de segurança e governança.

---

## 🛠️ Tecnologias Utilizadas

O sistema foi construído utilizando tecnologias web padrão (Vanilla Web), focando em performance e independência de frameworks:

* **HTML5:** Estruturação semântica com foco em acessibilidade (`aria-labels` e seções dedicadas).
* **CSS3:** Layout moderno baseado em **Grid** e **Flexbox**, uso de variáveis (`:root`) para consistência visual (Design System focado em tons de lilás e roxo) e total responsividade para dispositivos móveis.
* **JavaScript (ES6+):** Manipulação dinâmica do DOM, gerenciamento de estado dos dados (lotes, doadoras, receptoras) e funções de filtragem e ordenação.

---

## 📖 Como Usar (Passo a Passo)

### 1. Acesso ao Sistema
1. Ao abrir a aplicação, você será recebido pela tela de **Login Médico**.
2. O formulário já vem preenchido com dados de teste (`CRM-24581` e senha).
3. Escolha a **Unidade** desejada (ex: *UTI Neonatal*, *Banco de Leite*) e clique em **Entrar no painel**.

### 2. Navegando pelas Telas
Utilize a barra lateral (ou menu superior em telas menores) para alternar entre os módulos operacionais:
* **Painel:** Visão geral da operação, fila crítica do dia, sensores e o atalho para acionar a melhor rota.