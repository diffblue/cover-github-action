# Default to using the latest version of Diffblue Cover on JDK11
# Additional images are available for specific Diffblue Cover
# versions and JDK versions.
FROM diffblue/cover-cli:2024.05.01-jdk11

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Record the image-specific environment for later
RUN env > /.env

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
