#!/bin/bash

###############################################################################
# PMOS - Project Management Operating System
# 项目启动脚本
#
# 用法:
#   ./start.sh              # 启动前后端开发服务
#   ./start.sh --help       # 显示帮助信息
#   ./start.sh --frontend   # 仅启动前端
#   ./start.sh --backend    # 仅启动后端
#   ./start.sh --prod       # 启动生产环境
#   ./start.sh --stop       # 停止所有服务
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# 如果脚本在 scripts/ 目录下，则使用上级目录作为项目根目录
if [[ "$SCRIPT_DIR" == */scripts ]]; then
    PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    PROJECT_DIR="$SCRIPT_DIR"
fi

# 默认配置
BACKEND_PORT=18001
FRONTEND_PORT=16001
START_FRONTEND=true
START_BACKEND=true
PROD_MODE=false
STOP_MODE=false

# 打印函数
print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║              PMOS 项目管理系统                           ║"
    echo "║           Project Management Operating System            ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 显示帮助
show_help() {
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help, -h          显示此帮助信息"
    echo "  --frontend          仅启动前端开发服务器"
    echo "  --backend           仅启动后端 API 服务"
    echo "  --prod              启动生产环境 (构建前端)"
    echo "  --stop              停止所有运行中的服务"
    echo "  --status            显示服务状态"
    echo ""
    echo "默认行为: 同时启动前后端开发服务"
    echo ""
    echo "服务端口:"
    echo "  前端: http://localhost:${FRONTEND_PORT}"
    echo "  后端: http://localhost:${BACKEND_PORT}"
    echo "  API 文档: http://localhost:${BACKEND_PORT}/docs"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."

    local missing=0

    if command -v node &> /dev/null; then
        print_success "Node.js: $(node --version)"
    else
        print_error "Node.js 未安装，请先安装 Node.js 20+"
        missing=1
    fi

    if command -v uv &> /dev/null; then
        print_success "uv: $(uv --version)"
    else
        print_error "uv 未安装，请先安装 uv"
        missing=1
    fi

    if command -v mongod &> /dev/null || command -v docker &> /dev/null; then
        print_success "MongoDB 可用"
    else
        print_warning "MongoDB 可能未安装或未启动"
    fi

    if [ $missing -eq 1 ]; then
        print_error "请先安装缺失的依赖后重试"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    print_info "安装前端依赖..."
    cd "${PROJECT_DIR}/frontend" && npm install

    print_info "安装后端依赖..."
    cd "${PROJECT_DIR}/backend" && uv sync --dev

    cd "${PROJECT_DIR}"
    print_success "依赖安装完成"
}

# 启动前端
start_frontend() {
    print_info "启动前端开发服务器..."
    cd "${PROJECT_DIR}/frontend"
    npm run dev &
    FRONTEND_PID=$!
    print_success "前端已启动 (PID: ${FRONTEND_PID})"
    print_info "访问: http://localhost:${FRONTEND_PORT}"
}

# 启动后端
start_backend() {
    print_info "启动后端 API 服务..."
    cd "${PROJECT_DIR}/backend"
    uv run uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} --reload &
    BACKEND_PID=$!
    print_success "后端已启动 (PID: ${BACKEND_PID})"
    print_info "API: http://localhost:${BACKEND_PORT}"
    print_info "文档: http://localhost:${BACKEND_PORT}/docs"
}

# 生产模式构建
build_prod() {
    print_info "构建生产版本..."
    cd "${PROJECT_DIR}/frontend"
    npm run build
    print_success "前端构建完成"
}

# 停止服务
stop_services() {
    print_info "停止服务..."

    if command -v lsof &> /dev/null; then
        # 停止前端
        FRONTEND_PIDS=$(lsof -ti:${FRONTEND_PORT} 2>/dev/null || true)
        if [ -n "${FRONTEND_PIDS}" ]; then
            echo "${FRONTEND_PIDS}" | xargs kill -9 2>/dev/null || true
            print_success "前端服务已停止 (端口 ${FRONTEND_PORT})"
        fi

        # 停止后端
        BACKEND_PIDS=$(lsof -ti:${BACKEND_PORT} 2>/dev/null || true)
        if [ -n "${BACKEND_PIDS}" ]; then
            echo "${BACKEND_PIDS}" | xargs kill -9 2>/dev/null || true
            print_success "后端服务已停止 (端口 ${BACKEND_PORT})"
        fi
    else
        # macOS 兼容方式
        FRONTEND_PIDS=$(lsof -i :${FRONTEND_PORT} -t 2>/dev/null || true)
        if [ -n "${FRONTEND_PIDS}" ]; then
            kill -9 ${FRONTEND_PIDS} 2>/dev/null || true
            print_success "前端服务已停止 (端口 ${FRONTEND_PORT})"
        fi

        BACKEND_PIDS=$(lsof -i :${BACKEND_PORT} -t 2>/dev/null || true)
        if [ -n "${BACKEND_PIDS}" ]; then
            kill -9 ${BACKEND_PIDS} 2>/dev/null || true
            print_success "后端服务已停止 (端口 ${BACKEND_PORT})"
        fi
    fi

    print_info "所有服务已停止"
}

# 显示服务状态
show_status() {
    print_info "服务状态:"

    if lsof -i :${FRONTEND_PORT} -t &> /dev/null; then
        print_success "前端: 运行中 (http://localhost:${FRONTEND_PORT})"
    else
        print_warning "前端: 未运行"
    fi

    if lsof -i :${BACKEND_PORT} -t &> /dev/null; then
        print_success "后端: 运行中 (http://localhost:${BACKEND_PORT})"
    else
        print_warning "后端: 未运行"
    fi
}

# 清理函数
cleanup() {
    print_info "收到退出信号，正在停止服务..."
    stop_services
    exit 0
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --frontend)
            START_BACKEND=false
            shift
            ;;
        --backend)
            START_FRONTEND=false
            shift
            ;;
        --prod)
            PROD_MODE=true
            shift
            ;;
        --stop)
            STOP_MODE=true
            shift
            ;;
        --status)
            show_status
            exit 0
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 主逻辑
print_header

if [ "$STOP_MODE" = true ]; then
    stop_services
    exit 0
fi

if [ "$PROD_MODE" = true ]; then
    check_dependencies
    build_prod
    print_success "生产版本构建完成"
    print_info "使用 nginx 或其他方式提供静态文件服务"
    exit 0
fi

check_dependencies
trap cleanup INT TERM

print_info "正在启动服务..."
echo ""

if [ "$START_FRONTEND" = true ]; then
    start_frontend
fi

if [ "$START_BACKEND" = true ]; then
    start_backend
fi

echo ""
print_success "所有服务已启动!"
echo ""
echo "  前端: http://localhost:${FRONTEND_PORT}"
echo "  后端: http://localhost:${BACKEND_PORT}"
echo "  API 文档: http://localhost:${BACKEND_PORT}/docs"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo ""

# 等待后台进程
wait
