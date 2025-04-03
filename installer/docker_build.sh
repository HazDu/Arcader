#!/bin/bash
cd "$(dirname "$0")"

mkdir -p ../iso_output

echo "Building Docker image for ISO creation..."
docker build -t arcader-iso-builder .

echo "Running ISO builder in Docker container..."
docker run --rm --privileged \
  -v "$(pwd)/../iso_output:/output" \
  arcader-iso-builder

echo "Build complete! Check the iso_output directory for your ISO file."