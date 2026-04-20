#!/usr/bin/env bash
# Inicia o servidor manualmente (modo debug, mostra logs no terminal).
# Normalmente não é necessário — o systemd já sobe sozinho no boot.
# Use para testar ou ver erros em tempo real.

cd "$(dirname "$0")"

if ! command -v node &>/dev/null; then
  echo "ERRO: Node.js não encontrado. Execute ./instalar.sh primeiro."
  exit 1
fi

echo ""
echo "Iniciando em modo manual (Ctrl+C para parar)..."
echo "Para o serviço automático: sudo systemctl start sistema-m"
echo ""

node server.js
