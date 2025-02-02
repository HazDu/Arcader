#!/bin/bash

source ./utils.sh

build_target_system() {
    print_status "Creating target system..."
    debootstrap --arch=amd64 --variant=minbase bookworm "$TARGET_DIR" http://deb.debian.org/debian/

    mount -t proc none "$TARGET_DIR/proc"
    mount -t sysfs none "$TARGET_DIR/sys"
    mount -o bind /dev "$TARGET_DIR/dev"
    mount -o bind /dev/pts "$TARGET_DIR/dev/pts"

    cat > "$TARGET_DIR/setup.sh" << 'EOF'
#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive
export LANGUAGE=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

cat > /etc/apt/sources.list << 'INNEREOF'
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
INNEREOF

apt update
apt install -y linux-image-amd64 systemd-sysv locales

echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
locale-gen
update-locale LANG=en_US.UTF-8

apt install -y grub-pc grub-pc-bin grub-efi-amd64-bin grub-efi-amd64-signed efibootmgr

apt install -y --no-install-recommends openbox dbus-x11 xorg xinit x11-xserver-utils \
    isc-dhcp-client ifupdown net-tools iputils-ping wget gnupg2 gnupg sudo

apt update && apt install --reinstall ca-certificates -y
update-ca-certificates

wget -qO - https://arcader-sources.hazdu.de/gpg.key | apt-key add -

echo "deb https://arcader-sources.hazdu.de/ bookworm main" | tee /etc/apt/sources.list.d/arcader-sources.list > /dev/null

apt update
apt install -y arcader libasound2

cat > /etc/network/interfaces << 'NETEOF'
source /etc/network/interfaces.d/*

auto lo
iface lo inet loopback

auto eth0
allow-hotplug eth0
iface eth0 inet dhcp
NETEOF

cat > /etc/udev/rules.d/70-persistent-net.rules << 'UDEVEOF'
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{type}=="1", KERNEL=="en*", NAME="eth0"
SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{type}=="1", KERNEL=="eth*", NAME="eth0"
UDEVEOF

systemctl enable networking

apt remove --purge -y live-boot* live-config*
apt autoremove -y

useradd -m -s /bin/bash user
echo "user:password" | chpasswd

usermod -aG sudo user

mkdir -p /home/user/.config/openbox
cat > /home/user/.config/openbox/autostart << 'INNEREOF'

xset s off
xset s noblank
xset -dpms

DISABLE_COIN_SLOT=true ENABLE_JOYSTICK=false arcader
INNEREOF

cat > /home/user/.bash_profile << 'INNEREOF'
if [[ ! $DISPLAY && $XDG_VTNR -eq 1 ]]; then
    startx
fi
INNEREOF

cat > /home/user/.xinitrc << 'INNEREOF'
exec openbox-session
INNEREOF

mkdir -p /etc/systemd/system/getty@tty1.service.d/
cat > /etc/systemd/system/getty@tty1.service.d/override.conf << 'INNEREOF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin user --noclear %I $TERM
INNEREOF

chown -R user:user /home/user/

apt clean
rm -rf /var/lib/apt/lists/*
rm -rf /tmp/*
rm /var/lib/dbus/machine-id
EOF

    chmod +x "$TARGET_DIR/setup.sh"
    print_status "Running target system setup..."
    chroot "$TARGET_DIR" /setup.sh

    chroot "$TARGET_DIR" dpkg --get-selections > "$TARGET_DIR/package-selections"
    cp -r "$TARGET_DIR/var/cache/apt/archives" "$TARGET_DIR/saved-packages"

    umount "$TARGET_DIR/dev/pts"
    umount "$TARGET_DIR/dev"
    umount "$TARGET_DIR/sys"
    umount "$TARGET_DIR/proc"

    print_success "Target system setup complete"
}

build_installer_system() {
    print_status "Creating installer environment..."
    debootstrap --arch=amd64 --variant=minbase bookworm "$CHROOT_DIR" http://deb.debian.org/debian/

    mkdir -p "$CHROOT_DIR/installer"
    cat > "$CHROOT_DIR/installer/install.sh" << 'EOF'
#!/bin/bash

[ -f /utils.sh ] && source /utils.sh

setup_install_media() {
    if [ -f "/usr/lib/live/mount/medium/ARCADER" ]; then
        ln -sf /usr/lib/live/mount/medium /cdrom
        return 0
    fi

    local install_media=""
    local possible_devices=($(lsblk -lnp -o NAME,TYPE | grep -E "disk|part" | cut -d' ' -f1))

    mkdir -p /cdrom

    for device in "${possible_devices[@]}"; do
        if mount -t iso9660 "$device" /cdrom 2>/dev/null; then
            if [ -f "/cdrom/ARCADER" ]; then
                return 0
            fi
            umount /cdrom
        fi
    done

    return 1
}

if ! setup_install_media; then
    print_error "Could not find installation media!"
    exit 1
fi

print_banner

print_status "Welcome to the Arcader Installer!"
echo

print_status "Available disks:"
lsblk -d -n -p -o NAME,SIZE,MODEL | grep -E '^/dev/(sd|vd|nvme|hd)' | \
    while read disk; do
        if ! echo "$INSTALL_MEDIA" | grep -q "$(echo $disk | cut -d' ' -f1)"; then
            echo "$disk"
        fi
    done

echo
read -p "Enter the disk to install to (e.g., /dev/sda): " TARGET_DISK

if [ ! -b "$TARGET_DISK" ]; then
    print_error "Invalid disk device!"
    exit 1
fi

echo "WARNING: This will erase ALL data on $TARGET_DISK"
read -p "Are you sure you want to continue? (y/N): " confirm
if [ "$confirm" != "y" ]; then
    echo "Installation cancelled."
    exit 1
fi

print_status "Creating partitions..."

if [ -d /sys/firmware/efi ]; then
    # UEFI partitioning
    parted -s "$TARGET_DISK" mklabel gpt
    parted -s "$TARGET_DISK" mkpart ESP fat32 1MiB 261MiB
    parted -s "$TARGET_DISK" set 1 esp on
    parted -s "$TARGET_DISK" mkpart primary ext4 261MiB 100%

    mkfs.fat -F32 "${TARGET_DISK}1"
    mkfs.ext4 "${TARGET_DISK}2"

    mount "${TARGET_DISK}2" /mnt
    mkdir -p /mnt/boot/efi
    mount "${TARGET_DISK}1" /mnt/boot/efi
else
    # BIOS partitioning
    parted -s "$TARGET_DISK" mklabel msdos
    parted -s "$TARGET_DISK" mkpart primary ext4 1MiB 100%
    parted -s "$TARGET_DISK" set 1 boot on

    mkfs.ext4 "${TARGET_DISK}1"

    mount "${TARGET_DISK}1" /mnt
fi

print_status "Installing system..."

mkdir -p /mnt/{dev,proc,sys,run}

unsquashfs -f -d /mnt /cdrom/target-system/target-system.squashfs

if [ -d "/mnt/saved-packages" ]; then
    mkdir -p /mnt/var/cache/apt/archives
    cp -r /mnt/saved-packages/* /mnt/var/cache/apt/archives/
    rm -rf /mnt/saved-packages
fi

mount --bind /dev /mnt/dev
mount --bind /proc /mnt/proc
mount --bind /sys /mnt/sys

print_status "Generating fstab..."

ROOT_UUID=$(blkid -s UUID -o value $(findmnt -n -o SOURCE /mnt))

cat > /mnt/etc/fstab << FSTABEOF
UUID=${ROOT_UUID}          /               ext4    errors=remount-ro           0       1
FSTABEOF

if [ -d /sys/firmware/efi ]; then
    EFI_UUID=$(blkid -s UUID -o value "${TARGET_DISK}1")
    echo "UUID=${EFI_UUID}  /boot/efi       vfat    umask=0077                   0       1" >> /mnt/etc/fstab
fi

cat >> /mnt/etc/fstab << FSTABEOF
tmpfs                      /tmp            tmpfs   defaults,noatime,mode=1777   0       0
tmpfs                      /var/tmp        tmpfs   defaults,noatime,mode=1777   0       0
tmpfs                      /var/log        tmpfs   defaults,noatime,mode=0755   0       0
FSTABEOF

print_status "Installing bootloader..."

chroot /mnt bash -c "DEBIAN_FRONTEND=noninteractive apt install -y grub-pc grub-pc-bin grub-efi-amd64-bin grub-efi-amd64-signed efibootmgr"

mount --bind /dev/pts /mnt/dev/pts
mkdir -p /mnt/run/udev
mount --bind /run/udev /mnt/run/udev

chroot /mnt bash -c "apt install -y linux-image-amd64"
chroot /mnt bash -c "update-initramfs -u"

if [ -d /sys/firmware/efi ]; then
    # UEFI mode
    chroot /mnt bash -c "grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=debian"
else
    # BIOS mode
    chroot /mnt bash -c "grub-install $TARGET_DISK"
fi

chroot /mnt bash -c "update-grub"

umount /mnt/run/udev
umount /mnt/dev/pts
umount /mnt/{dev,proc,sys}
if [ -d /sys/firmware/efi ]; then
    umount /mnt/boot/efi
fi
umount /mnt

print_success "Installation complete! You can now reboot into your new system."
read -p "Press Enter to reboot..."
reboot
EOF

    chmod +x "$CHROOT_DIR/installer/install.sh"
    cp utils.sh "$CHROOT_DIR/"

    cat > "$CHROOT_DIR/setup.sh" << 'EOF'
#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

apt update
apt install -y linux-image-amd64 systemd-sysv parted dosfstools squashfs-tools efibootmgr \
    live-boot live-boot-initramfs-tools live-config live-config-systemd

update-initramfs -u

mkdir -p /etc/systemd/system/getty@tty1.service.d/
cat > /etc/systemd/system/getty@tty1.service.d/override.conf << 'INNEREOF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --noclear --autologin root %I $TERM
Type=idle
INNEREOF

echo "/installer/install.sh" >> /root/.profile

apt clean
rm -rf /var/lib/apt/lists/*
EOF

    chmod +x "$CHROOT_DIR/setup.sh"
    print_status "Running installer setup..."
    chroot "$CHROOT_DIR" /setup.sh
    print_success "Installer setup complete"
}