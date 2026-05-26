#!/bin/bash

###############################################################################
# PMOS - Docker 启动脚本
#
# 用法:
#   ./docker-start.sh           # 启动所有 Docker 服务
#   ./docker-start.sh --help    # 显示帮助信息
#   ./docker-start.sh --build   # 重新构建镜像
#   ./docker-start.sh --stop    # 停止所有服务
#   ./docker-start.sh --logs    # 查看日志
#   ./docker-start.sh --status  # 查看服务状态
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ "$SCRIPT_DIR" == */scripts ]]; then
    PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    PROJECT_DIR="$SCRIPT_DIR"
fi
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

print_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║              PMOS Docker 部署                            ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_help() {
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help, -h          显示此帮助信息"
    echo "  --build             重新构建 Docker 镜像"
    echo "  --stop              停止所有 Docker 服务"
    echo "  --logs              查看服务日志"
    echo "  --status            查看服务状态"
    echo "  --restart           重启所有服务"
    echo ""
    echo "服务端口:"
    echo "  前端: http://localhost:80"
    echo "  后端: http://localhost:18001"
    echo "  MongoDB: localhost:27017"
    echo "  API 文档: http://localhost:18001/docs"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker 未运行，请启动 Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装"
        exit 1
    fi
}

# 使用 docker compose 或 docker-compose
docker_compose() {
    if docker compose version &> /dev/null; then
        docker compose -f "${COMPOSE_FILE}" "$@"
    else
        docker-compose -f "${COMPOSE_FILE}" "$@"
    fi
}

build_images() {
    print_info "构建 Docker 镜像..."
    docker_compose build
    print_success "镜像构建完成"
}

start_services() {
    print_info "启动 Docker 服务..."
    docker_compose up -d

    print_success "服务已启动!"
    echo ""
    echo "  前端: http://localhost:80"
    echo "  后端: http://localhost:18001"
    echo "  MongoDB: localhost:27017"
    echo "  API 文档: http://localhost:18001/docs"
    echo ""
}

stop_services() {
    print_info "停止 Docker 服务..."
    docker_compose down
    print_success "服务已停止"
}

show_status() {
    print_info "服务状态:"
    echo ""
    docker_compose ps
}

show_logs() {
    docker_compose logs -f
}

restart_services() {
    print_info "重启服务..."
    docker_compose restart
    print_success "服务已重启"
}

# 解析参数
ACTION="start"
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --build)
            ACTION="build"
            shift
            ;;
        --stop)
            ACTION="stop"
            shift
            ;;
        --logs)
            ACTION="logs"
            shift
            ;;
        --status)
            ACTION="status"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行操作
print_header
check_docker

case $ACTION in
    build)
        build_images
        start_services
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    restart)
        restart_services
        ;;
esac
