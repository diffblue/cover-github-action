# Default to using the latest version of Diffblue Cover on JDK8
# Additional images are available for specific Diffblue Cover
# versions and JDK versions.
FROM docker.io/diffblue/internal-cover-cli:release-2024.03.02-2024.03.02-rc2-jdk8

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Record the image-specific environment for later
RUN env > /.env

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
