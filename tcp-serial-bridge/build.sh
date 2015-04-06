#!/bin/bash -ex
source $HOME/gopath/setup.sh
# install gccgo-4.9-multilib
#GO386=387 GOARCH=386 go build . # illegal instruction in v86
GOARCH=386 go build -compiler gccgo -gccgoflags "-static" .

#this breaks with gccgo:
#$GOPATH/bin/goupx -s serial-http-proxy

#bzip2 -kf9 tcp-serial-bridge
#mksquashfs tcp-serial-bridge squashfs

#dd if=/dev/zero of=squashfs oflag=append conv=notrunc bs=1 count=$((1440 * 1024 - $(stat -c%s squashfs)))

#hushfile tcp-serial-bridge.bz2
