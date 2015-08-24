1. `nc -lp 13337`
1. `socat PTY,link=lol tcp:localhost:1337`
1. `./tcp-serial-bridge lol`
1. `curl -x localhost:8083 ip.tyk.nu`
