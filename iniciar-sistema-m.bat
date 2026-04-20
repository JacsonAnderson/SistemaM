@echo off
chcp 65001 >nul
title Sistema M - Servidor Local
cd /d "%~dp0"

REM Verifica se Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ===============================================
    echo   ERRO: Node.js nao esta instalado
    echo ===============================================
    echo.
    echo   O Sistema M precisa do Node.js para rodar o
    echo   servidor local que guarda seus dados.
    echo.
    echo   Baixe em: https://nodejs.org
    echo   Escolha a versao LTS. Instalador normal.
    echo   Clique "Next" ate o fim. Reinicie o PC.
    echo.
    echo   Depois, abra este arquivo novamente.
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo   SISTEMA M - Servidor Local
echo ===============================================
echo.
echo   URL: http://localhost:3737
echo.
echo   ^>^>^> MANTENHA ESTA JANELA ABERTA ^<^<^<
echo   Ela e o servidor. Se fechar, os dados
echo   param de ser salvos ate reabrir.
echo.
echo   Para parar: feche esta janela.
echo.
echo ===============================================
echo.

node server.js

REM Se chegou aqui, o servidor caiu
echo.
echo ===============================================
echo   Servidor encerrado.
echo   Aperte qualquer tecla para fechar.
echo ===============================================
pause >nul
