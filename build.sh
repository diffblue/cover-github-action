#!/usr/bin/env bash
set +x

# The JDK version string referenced in the base directory
JDKBASE=JDK17
jdkbase=$(echo $JDKBASE | tr '[:upper:]' '[:lower:]')

# For each JDK version to be supported in a separate directory
for JDK in "JDK8" "JDK11" "JDK17" "JDK21"; do
    jdk=$(echo $JDK | tr '[:upper:]' '[:lower:]')

    mkdir -p $jdk/

    for file in action.yml entrypoint.sh Dockerfile; do
        echo "Updating $jdk/$file"
        cat $file | sed -e s/$JDKBASE/$JDK/g -e s/$jdkbase/$jdk/g > $jdk/$file
    done
done
