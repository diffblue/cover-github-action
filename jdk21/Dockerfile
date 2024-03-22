# Default to using the latest version of Diffblue Cover on JDK21
# Additional images are available for specific Diffblue Cover
# versions and JDK versions.
FROM docker.io/diffblue/internal-cover-cli:mn-tg-21088-2024.03.02-snapshot-jdk21

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Record the image-specific environment for later
RUN env > /.env

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
