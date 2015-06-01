Get started
---

1. make sure v86 is in the parent directory
1. open `basic.html`
2. wait for boot
2. log in as root
3. upload tcp-serial-bridge
4. chmod +x /tcp-serial-bridge
5. ifconfig lo up
6. push `set up proxy` above the emulator
6. `/tcp-serial-bridge /dev/ttyS0 8080`
7. `curl --proxy 127.0.0.1 8080 ip.tyk.nu`

Files overview
---

* `build`: "Production" build
* `debug`: Debug build (also installs dependencies)
* `http-server.js`: Primary contribution
* `proxy.js`: Proxy from the Node.js docs
* `bu.html`: If the websockets break, use this
* `test.html`: Primary entry point/test
* `ReadWriteNetStream.js`: Emulates Node.js net.Socket
