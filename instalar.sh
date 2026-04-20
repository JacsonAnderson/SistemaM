#!/usr/bin/env bash
# Instala o Sistema M como serviço systemd no Ubuntu.
# Execute UMA VEZ, na máquina servidor:
#   chmod +x instalar.sh && sudo ./instalar.sh

set -euo pipefail

SERVICE_NAME="sistema-m"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── precisa rodar como root ──────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  echo "Execute com sudo:  sudo ./instalar.sh"
  exit 1
fi

# ── usuário real (quem chamou o sudo) ────────────────────────────────────────
REAL_USER="${SUDO_USER:-$USER}"
REAL_HOME=$(eval echo "~$REAL_USER")

echo ""
echo "═══════════════════════════════════════════════"
echo "  SISTEMA M — Instalador Linux"
echo "═══════════════════════════════════════════════"
echo "  Diretório : $SCRIPT_DIR"
echo "  Usuário   : $REAL_USER"
echo "═══════════════════════════════════════════════"
echo ""

# ── Node.js ──────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "[1/4] Instalando Node.js LTS..."
  apt-get update -qq
  apt-get install -y -q curl
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - &>/dev/null
  apt-get install -y -q nodejs
else
  echo "[1/4] Node.js já instalado: $(node --version)"
fi

NODE_BIN="$(command -v node)"

# ── permissão de execução nos scripts ────────────────────────────────────────
echo "[2/4] Ajustando permissões..."
chown -R "$REAL_USER":"$REAL_USER" "$SCRIPT_DIR"
chmod +x "$SCRIPT_DIR/iniciar-sistema-m.sh" 2>/dev/null || true

# ── serviço systemd ──────────────────────────────────────────────────────────
echo "[3/4] Criando serviço systemd..."

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Sistema M - Servidor Local
After=network.target

[Service]
Type=simple
User=$REAL_USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$NODE_BIN $SCRIPT_DIR/server.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# ── ativa e inicia ───────────────────────────────────────────────────────────
echo "[4/4] Ativando serviço (início automático no boot)..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

sleep 2

echo ""
echo "═══════════════════════════════════════════════"
echo "  Instalação concluída!"
echo ""
echo "  URL local:   http://localhost:3737"

# mostra IP LAN
LAN_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
if [ -n "$LAN_IP" ]; then
  echo "  URL na rede: http://$LAN_IP:3737"
fi

echo ""
echo "  O servidor sobe sozinho ao ligar o PC."
echo "  Comandos úteis:"
echo "    sudo systemctl status sistema-m"
echo "    sudo journalctl -u sistema-m -f"
echo "    sudo systemctl restart sistema-m"
echo "    sudo systemctl stop sistema-m"
echo "═══════════════════════════════════════════════"
echo ""
