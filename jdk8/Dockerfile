# Default to using the latest version of Diffblue Cover on JDK8
# Additional images are available for specific Diffblue Cover
# versions and JDK versions.
FROM docker.io/diffblue/internal-cover-cli:roxspring-tg-21574-ci-patch-mode-awareness-2024.07.01-snapshot-jdk8

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Record the image-specific environment for later
RUN env > /.env

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
