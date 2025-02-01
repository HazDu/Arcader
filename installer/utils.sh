#!/bin/bash

export RED='\033[0;31m'
export GREEN='\033[0;32m'
export BLUE='\033[0;34m'
export YELLOW='\033[1;33m'
export CYAN='\033[0;36m'
export PURPLE='\033[0;35m'
export NC='\033[0m'

progress_bar() {
    local duration=$1
    local width=50
    local progress=0
    local step=$((100 / width))

    printf "${CYAN}["
    while [ $progress -lt 100 ]; do
        progress=$((progress + step))
        printf "#"
        sleep $(echo "scale=3; $duration/$width" | bc)
    done
    printf "]${NC}\n"
}

print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[+]${NC} $1"
}

print_error() {
    echo -e "${RED}[-]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_banner() {
    echo -e "${CYAN}"
    cat << "BANNER"

  /$$$$$$                                      /$$
 /$$__  $$                                    | $$
| $$  \ $$  /$$$$$$   /$$$$$$$  /$$$$$$   /$$$$$$$  /$$$$$$   /$$$$$$
| $$$$$$$$ /$$__  $$ /$$_____/ |____  $$ /$$__  $$ /$$__  $$ /$$__  $$
| $$__  $$| $$  \__/| $$        /$$$$$$$| $$  | $$| $$$$$$$$| $$  \__/
| $$  | $$| $$      | $$       /$$__  $$| $$  | $$| $$_____/| $$
| $$  | $$| $$      |  $$$$$$$|  $$$$$$$|  $$$$$$$|  $$$$$$$| $$
|__/  |__/|__/       \_______/ \_______/ \_______/ \_______/|__/
BANNER
    echo -e "${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root"
        exit 1
    fi
}

ensure_unmount() {
    local dir=$1
    for vfs in "proc" "sys" "dev"; do
        if mountpoint -q "$dir/$vfs"; then
            umount -lf "$dir/$vfs" 2>/dev/null || true
        fi
    done
}

cleanup() {
    print_status "Cleaning up..."
    for mount in "$TARGET_DIR/dev" "$TARGET_DIR/proc" "$TARGET_DIR/sys"; do
        while mountpoint -q "$mount"; do
            umount -l "$mount" || true
        done
    done
    rm -rf "$TARGET_DIR" "$CHROOT_DIR" image scratch
    print_success "Cleanup complete"
}