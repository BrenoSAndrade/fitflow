@echo off
cd /d "%~dp0"
set "FITFLOW_NODE=node"
if exist "%~dp0..\work\runtime\node_modules\node\bin\node.exe" set "FITFLOW_NODE=%~dp0..\work\runtime\node_modules\node\bin\node.exe"
"%FITFLOW_NODE%" ferramentas\iniciar.cjs %*
