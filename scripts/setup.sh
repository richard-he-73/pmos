#!/bin/bash

###############################################################################
# PMOS - 项目安装与设置脚本
#
# 用法:
#   ./setup.sh              # 一键安装和配置
#   ./setup.sh --help       # 显示帮助信息
#   ./setup.sh --deps       # 仅安装依赖
#   ./setup.sh --db         # 仅配置数据库
#   ./setup.sh --env        # 仅配置环境变量
#   ./setup.sh --all        # 完整安装 (默认)
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ "$SCRIPT_DIR" == */scripts ]]; then
    PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    PROJECT_DIR="$SCRIPT_DIR"
fi

print_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║              PMOS 项目安装与设置                         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_help() {
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help, -h          显示此帮助信息"
    echo "  --deps              仅安装项目依赖"
    echo "  --db                仅配置数据库 (MongoDB)"
    echo "  --env               仅配置环境变量"
    echo "  --migrate           仅运行数据库迁移"
    echo "  --all               完整安装 (默认)"
    echo ""
}

# 安装前端依赖
install_frontend_deps() {
    print_info "安装前端依赖..."
    cd "${PROJECT_DIR}/frontend"
    if [ -d "node_modules" ]; then
        print_info "发现已有的 node_modules，执行 npm install..."
    fi
    npm install
    print_success "前端依赖安装完成"
    cd "${PROJECT_DIR}"
}

# 安装后端依赖
install_backend_deps() {
    print_info "安装后端依赖..."
    cd "${PROJECT_DIR}/backend"
    uv sync --dev
    print_success "后端依赖安装完成"
    cd "${PROJECT_DIR}"
}

# 配置环境变量
setup_env() {
    print_info "配置环境变量..."

    # 后端 .env
    if [ ! -f "${PROJECT_DIR}/backend/.env" ]; then
        cat > "${PROJECT_DIR}/backend/.env" << 'EOF'
# PMOS Backend Configuration
APP_NAME=PMOS
MONGO_URL=mongodb://localhost:27017
DB_NAME=pmos
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:16001,http://localhost:3000

# Redis (可选)
REDIS_URL=redis://localhost:6379/0

# SMTP (邮件通知，可选)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
FROM_EMAIL=
FROM_NAME=PMOS 系统
EOF
        print_success "后端 .env 文件已创建"
    else
        print_info "后端 .env 文件已存在，跳过"
    fi

    # 前端 .env
    if [ ! -f "${PROJECT_DIR}/frontend/.env.local" ]; then
        cat > "${PROJECT_DIR}/frontend/.env.local" << 'EOF'
# PMOS Frontend Configuration
VITE_API_BASE_URL=http://localhost:18001/api/v1
VITE_APP_NAME=PMOS
EOF
        print_success "前端 .env.local 文件已创建"
    else
        print_info "前端 .env.local 文件已存在，跳过"
    fi
}

# 配置数据库
setup_database() {
    print_info "检查 MongoDB..."

    if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
        if mongosh --eval "db.runCommand({ping: 1})" --quiet &> /dev/null || \
           mongo --eval "db.runCommand({ping: 1})" --quiet &> /dev/null; then
            print_success "MongoDB 连接成功"
        else
            print_warning "MongoDB 未运行，请确保 MongoDB 已启动"
            print_info "可使用 Docker 启动: docker run -d -p 27017:27017 --name pmos-mongo mongo:latest"
        fi
    else
        print_warning "mongosh 未安装，跳过数据库检查"
        print_info "可使用 Docker 启动 MongoDB:"
        print_info "  docker run -d -p 27017:27017 --name pmos-mongo mongo:latest"
    fi
}

# 运行数据库迁移
run_migrations() {
    print_info "运行数据库迁移..."
    cd "${PROJECT_DIR}/backend"
    if [ -f "migrate.py" ]; then
        uv run python migrate.py status
        uv run python migrate.py upgrade
        print_success "数据库迁移完成"
    else
        print_warning "迁移脚本不存在"
    fi
    cd "${PROJECT_DIR}"
}

# 完整安装
full_setup() {
    print_header

    print_info "开始安装 PMOS..."
    echo ""

    print_info "步骤 1/5: 安装前端依赖"
    install_frontend_deps
    echo ""

    print_info "步骤 2/5: 安装后端依赖"
    install_backend_deps
    echo ""

    print_info "步骤 3/5: 配置环境变量"
    setup_env
    echo ""

    print_info "步骤 4/5: 检查数据库"
    setup_database
    echo ""

    print_info "步骤 5/5: 运行数据库迁移"
    run_migrations
    echo ""

    print_success "PMOS 安装与设置完成!"
    echo ""
    echo "  启动开发服务器:"
    echo "    ./start.sh"
    echo ""
    echo "  或分别启动:"
    echo "    cd frontend && npm run dev"
    echo "    cd backend && uv run uvicorn app.main:app --reload"
    echo ""
}

# 解析参数
ACTION="all"
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --deps)
            ACTION="deps"
            shift
            ;;
        --db)
            ACTION="db"
            shift
            ;;
        --env)
            ACTION="env"
            shift
            ;;
        --migrate)
            ACTION="migrate"
            shift
            ;;
        --all)
            ACTION="all"
            shift
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行对应操作
case $ACTION in
    deps)
        install_frontend_deps
        install_backend_deps
        ;;
    db)
        setup_database
        ;;
    env)
        setup_env
        ;;
    migrate)
        run_migrations
        ;;
    all)
        full_setup
        ;;
esac
