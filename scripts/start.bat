@echo off
REM =============================================================================
REM PMOS - Project Management Operating System
REM Windows 启动脚本
REM
REM 用法:
REM   start.bat              启动前后端开发服务
REM   start.bat --help       显示帮助信息
REM   start.bat --frontend   仅启动前端
REM   start.bat --backend    仅启动后端
REM   start.bat --stop       停止所有服务
REM   start.bat --status     显示服务状态
REM =============================================================================

setlocal enabledelayedexpansion

REM 颜色代码 (Windows 10+)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM 项目根目录
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

REM 默认配置
set "BACKEND_PORT=18001"
set "FRONTEND_PORT=16001"
set "START_FRONTEND=true"
set "START_BACKEND=true"
set "ACTION=normal"

REM 打印函数
:print_info
echo %INFO% %~1
goto :eof

:print_success
echo %SUCCESS% %~1
goto :eof

:print_warning
echo %WARNING% %~1
goto :eof

:print_error
echo %ERROR% %~1
goto :eof

:print_header
echo.
echo ============================================================
echo           PMOS 项目管理系统
echo        Project Management Operating System
echo ============================================================
echo.
goto :eof

REM 显示帮助
:show_help
echo.
echo 用法: start.bat [选项]
echo.
echo 选项:
echo   --help, -h          显示此帮助信息
echo   --frontend          仅启动前端开发服务器
echo   --backend           仅启动后端 API 服务
echo   --stop              停止所有运行中的服务
echo   --status            显示服务状态
echo.
echo 默认行为: 同时启动前后端开发服务
echo.
echo 服务端口:
echo   前端: http://localhost:%FRONTEND_PORT%
echo   后端: http://localhost:%BACKEND_PORT%
echo   API 文档: http://localhost:%BACKEND_PORT%/docs
echo.
goto :eof

REM 检查依赖
:check_dependencies
echo %INFO% 检查依赖...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %ERROR% Node.js 未安装，请先安装 Node.js 20+
    goto :eof
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %SUCCESS% Node.js: !NODE_VERSION!

where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo %ERROR% uv 未安装，请先安装 uv
    goto :eof
)
echo %SUCCESS% uv 已安装

echo %SUCCESS% 依赖检查完成
goto :eof

REM 安装依赖
:install_dependencies
echo %INFO% 安装前端依赖...
cd /d "%PROJECT_DIR%\frontend"
call npm install

echo.
echo %INFO% 安装后端依赖...
cd /d "%PROJECT_DIR%\backend"
call uv sync --dev

cd /d "%PROJECT_DIR%"
echo %SUCCESS% 依赖安装完成
goto :eof

REM 启动前端
:start_frontend
echo %INFO% 启动前端开发服务器...
cd /d "%PROJECT_DIR%\frontend"
start "PMOS Frontend" cmd /c "npm run dev"
echo %SUCCESS% 前端已启动
echo %INFO% 访问: http://localhost:%FRONTEND_PORT%
cd /d "%PROJECT_DIR%"
goto :eof

REM 启动后端
:start_backend
echo %INFO% 启动后端 API 服务...
cd /d "%PROJECT_DIR%\backend"
start "PMOS Backend" cmd /c "uv run uvicorn app.main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"
echo %SUCCESS% 后端已启动
echo %INFO% API: http://localhost:%BACKEND_PORT%
echo %INFO% 文档: http://localhost:%BACKEND_PORT%/docs
cd /d "%PROJECT_DIR%"
goto :eof

REM 停止服务
:stop_services
echo %INFO% 停止服务...

REM 尝试停止前端进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT% ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo %SUCCESS% 前端服务已停止 (端口 %FRONTEND_PORT%)
)

REM 尝试停止后端进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT% ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo %SUCCESS% 后端服务已停止 (端口 %BACKEND_PORT%)
)

echo %INFO% 所有服务已停止
goto :eof

REM 显示服务状态
:show_status
echo %INFO% 服务状态:

netstat -ano | findstr :%FRONTEND_PORT% | findstr LISTENING >nul 2>nul
if %errorlevel% equ 0 (
    echo %SUCCESS% 前端: 运行中 (http://localhost:%FRONTEND_PORT%)
) else (
    echo %WARNING% 前端: 未运行
)

netstat -ano | findstr :%BACKEND_PORT% | findstr LISTENING >nul 2>nul
if %errorlevel% equ 0 (
    echo %SUCCESS% 后端: 运行中 (http://localhost:%BACKEND_PORT%)
) else (
    echo %WARNING% 后端: 未运行
)
goto :eof

REM 解析参数
if "%~1"=="" goto :main
if "%~1"=="--help" goto :show_help
if "%~1"=="-h" goto :show_help
if "%~1"=="--frontend" set "START_BACKEND=false"
if "%~1"=="--backend" set "START_FRONTEND=false"
if "%~1"=="--stop" goto :stop_services
if "%~1"=="--status" goto :show_status

REM 主逻辑
:main
call :print_header

REM 检查依赖
call :check_dependencies
echo.

echo %INFO% 正在启动服务...
echo.

if "%START_FRONTEND%"=="true" call :start_frontend
if "%START_BACKEND%"=="true" call :start_backend

echo.
echo %SUCCESS% 所有服务已启动!
echo.
echo   前端: http://localhost:%FRONTEND_PORT%
echo   后端: http://localhost:%BACKEND_PORT%
echo   API 文档: http://localhost:%BACKEND_PORT%/docs
echo.
echo   关闭窗口或运行 start.bat --stop 可停止服务
echo.
pause
