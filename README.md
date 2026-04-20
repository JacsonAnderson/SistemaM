<div align="center">

```
███████╗██╗███████╗████████╗███████╗███╗   ███╗ █████╗
██╔════╝██║██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔══██╗
███████╗██║███████╗   ██║   █████╗  ██╔████╔██║███████║
╚════██║██║╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║██╔══██║
███████║██║███████║   ██║   ███████╗██║ ╚═╝ ██║██║  ██║
╚══════╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝  M
```

**Sistema pessoal de gestão de projetos e hábitos.**  
Zero dependências. Roda local. Seus dados ficam no seu disco.

![Node.js](https://img.shields.io/badge/Node.js-vanilla-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Zero deps](https://img.shields.io/badge/dependências-zero-orange?style=flat-square)
![Plataforma](https://img.shields.io/badge/Linux%20%7C%20Windows%20%7C%20Mac-compatível-blue?style=flat-square)
![Licença](https://img.shields.io/badge/licença-MIT-green?style=flat-square)

</div>

---

## O que é

Sistema M é um gerenciador pessoal que roda inteiramente na sua máquina. Sem conta, sem nuvem, sem assinatura. Você abre no navegador como qualquer app web, mas os dados ficam num arquivo JSON no seu HD — e só na sua rede local.

A filosofia é simples: **três pilares, uma temporada, uma regra.**

---

## A regra dos 10%

> *"Quando bater vontade de parar, faça só mais 10%."*

O CCA — córtex cingulado anterior — é o músculo da disciplina. Cada vez que você faz algo que não quer fazer, ele se fortalece. Cada vez que você desiste, ele atrofia. O Sistema M foi construído em torno dessa ideia: não perfeição, mas consistência mínima.

---

## Os três pilares

| Pilar | O que vai aqui |
|---|---|
| **Estabilidade** | O que paga as contas. Projetos que não podem parar. |
| **Crescimento** | Seu mergulho de 3–6 meses. Um só. Com foco total. |
| **Laboratório** | Curiosidades, experimentos, interesses sem prazo. |

Cada projeto tem tarefas. Tarefas marcadas como **diárias** aparecem automaticamente na view *Hoje* todo dia.

---

## Funcionalidades

- **Hoje** — visão do dia com tarefas diárias de todos os projetos
- **Pilares** — organize projetos nos três eixos acima
- **Captura** — inbox para ideias, anotações e lembretes soltos
- **Temporada** — defina o foco de um ciclo de meses
- **+10%** — contador de vezes que você persistiu quando queria parar
- **Retrospecto de ontem** — resumo automático do dia anterior
- **Backups automáticos** — um arquivo por dia, mantidos por 60 dias
- **Acesso pela rede LAN** — abra do notebook, celular ou outro PC da casa
- **Atalhos de teclado** — navegação sem mouse
- **Sem banco de dados** — tudo em um único `sistema-m.json`

---

## Instalação

### Linux (recomendado para servidor sempre ligado)

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/SistemaM.git ~/SistemaM
cd ~/SistemaM

# Instala como serviço systemd (sobe sozinho no boot)
chmod +x instalar.sh
sudo ./instalar.sh
```

Abra: **http://localhost:3737**

O servidor fica rodando em background. Na próxima vez que ligar o PC, já estará de pé.

### Windows

```batch
# Clique duas vezes em:
iniciar-sistema-m.bat
```

Abre o servidor e já lança o navegador automaticamente.

### Manual (qualquer sistema com Node.js)

```bash
node server.js
```

---

## Estrutura

```
SistemaM/
├── server.js              ← servidor HTTP (Node.js vanilla, zero deps)
├── index.html             ← toda a interface (HTML + CSS + JS inline)
├── instalar.sh            ← instalador Linux (cria serviço systemd)
├── iniciar-sistema-m.bat  ← atalho Windows
├── iniciar-sistema-m.sh   ← atalho Linux/Mac
└── dados/                 ← criada automaticamente
    ├── sistema-m.json     ← seu banco de dados
    └── backups/           ← backups diários (60 dias)
```

---

## Atualizar

Após clonar, para puxar novas versões no servidor:

```bash
cd ~/SistemaM
git pull
sudo systemctl restart sistema-m
```

---

## Segurança

O servidor **só aceita conexões da rede local** (127.0.0.1, 192.168.x.x, 10.x.x.x). Qualquer requisição de fora recebe `403 Forbidden`. Não exponha a porta 3737 para a internet.

---

## Design

Interface dark com tipografia editorial — **Fraunces** para títulos, **JetBrains Mono** para dados, **Instrument Serif** para destaques. A paleta é quente mas sóbria, pensada para longas sessões sem cansar.

---

## Filosofia

A maioria dos apps de produtividade vira uma segunda caixa de entrada que você precisa gerenciar. Sistema M tenta ser o contrário: uma superfície pequena, opinada, que te força a escolher *um* foco por vez e te lembra disso todo dia.

Não tem sincronização porque seu foco não precisa estar no celular o tempo todo.  
Não tem colaboração porque gestão pessoal é pessoal.  
Não tem plugins porque complexidade é o inimigo do uso consistente.

---

## Requisitos

- Node.js 18+ (instalado automaticamente pelo `instalar.sh`)
- Navegador moderno
- Nada mais

---

<div align="center">

*Feito para uso próprio. Compartilhado porque talvez seja útil pra mais alguém.*

</div>
