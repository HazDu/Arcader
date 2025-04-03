FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    debootstrap \
    squashfs-tools \
    xorriso \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools \
    parted \
    wget \
    curl \
    git \
    cpio \
    procps \
    bsdutils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY main.sh /build/
COPY system_builder.sh /build/
COPY utils.sh /build/

RUN chmod +x /build/*.sh

VOLUME ["/output"]
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["cd /build && ./main.sh"]