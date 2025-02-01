#!/bin/bash

source ./utils.sh
source ./system_builder.sh

trap cleanup EXIT

print_banner

check_root

print_status "Installing dependencies..."
apt update
apt install -y debootstrap squashfs-tools xorriso grub-pc-bin \
    grub-efi-amd64-bin mtools parted

WORK_DIR=$(pwd)
ISO_NAME="arcader.iso"
CHROOT_DIR="$WORK_DIR/chroot"
TARGET_DIR="$WORK_DIR/target-system"

print_status "Cleaning up previous build..."
rm -rf "$CHROOT_DIR" "$TARGET_DIR"
mkdir -p "$CHROOT_DIR" "$TARGET_DIR"

print_status "Building target system..."
build_target_system

print_status "Creating squashfs..."
mkdir -p "$WORK_DIR/target-squashfs"
mksquashfs "$TARGET_DIR" "$WORK_DIR/target-squashfs/target-system.squashfs" -comp xz \
    -e "$TARGET_DIR/proc/*" -e "$TARGET_DIR/sys/*" -e "$TARGET_DIR/dev/*" -e "$TARGET_DIR/run/*"

print_status "Building installer system..."
build_installer_system

print_status "Creating ISO structure..."
rm -rf image scratch
mkdir -p {image/live,scratch,image/target-system}

print_status "Copying system files..."
mksquashfs "$CHROOT_DIR" image/live/filesystem.squashfs -comp xz -e boot 2>/dev/null
cp "$WORK_DIR/target-squashfs/target-system.squashfs" image/target-system/

cp "$CHROOT_DIR/boot/vmlinuz-"* image/vmlinuz
cp "$CHROOT_DIR/boot/initrd.img-"* image/initrd

print_status "Creating GRUB configuration..."
mkdir -p grub
cat > grub/grub.cfg << 'EOF'
search --set=root --file /ARCADER
insmod all_video

set default=0
set timeout=1

menuentry "Install Arcader" {
    linux /vmlinuz boot=live components quiet
    initrd /initrd
}
EOF

touch image/ARCADER

print_status "Creating GRUB images..."
cp grub/grub.cfg scratch/
grub-mkstandalone \
    --format=x86_64-efi \
    --output=scratch/bootx64.efi \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=scratch/grub.cfg"

(cd scratch && \
    dd if=/dev/zero of=efiboot.img bs=1M count=10 && \
    mkfs.vfat efiboot.img && \
    mmd -i efiboot.img efi efi/boot && \
    mcopy -i efiboot.img ./bootx64.efi ::efi/boot/)

grub-mkstandalone \
    --format=i386-pc \
    --output=scratch/core.img \
    --install-modules="linux normal iso9660 biosdisk memdisk search tar ls" \
    --modules="linux normal iso9660 biosdisk search" \
    --locales="" \
    --fonts="" \
    "boot/grub/grub.cfg=scratch/grub.cfg"

cat /usr/lib/grub/i386-pc/cdboot.img scratch/core.img > scratch/bios.img

print_status "Creating final ISO..."
progress_bar 3
xorriso \
    -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "ARCADER" \
    -isohybrid-mbr /usr/lib/grub/i386-pc/boot_hybrid.img \
    -eltorito-boot \
        boot/grub/bios.img \
        -no-emul-boot \
        -boot-load-size 4 \
        -boot-info-table \
        --eltorito-catalog boot/grub/boot.cat \
    --grub2-boot-info \
    --eltorito-alt-boot \
        -e EFI/efiboot.img \
        -no-emul-boot \
    -append_partition 2 0xef scratch/efiboot.img \
    -output "$ISO_NAME" \
    -graft-points \
        "/live"="$WORK_DIR/image/live" \
        "/target-system"="$WORK_DIR/target-squashfs" \
        "/vmlinuz"="$WORK_DIR/image/vmlinuz" \
        "/initrd"="$WORK_DIR/image/initrd" \
        "/ARCADER"="$WORK_DIR/image/ARCADER" \
        "/boot/grub/bios.img"="$WORK_DIR/scratch/bios.img" \
        "/EFI/efiboot.img"="$WORK_DIR/scratch/efiboot.img"

rm -rf "$WORK_DIR/target-squashfs"

print_success "ISO creation complete! Your installer ISO is: ${ISO_NAME}"