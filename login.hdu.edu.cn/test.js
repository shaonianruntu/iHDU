const ping = require("ping");
const login = require("./login");

const host = "www.baidu.com";

function newPing(host) {
  return ping.promise.probe(host).then(function (res) {
    console.log(
      res.alive ? "host " + host + " is alive" : "host " + host + " is dead"
    );
    return res;
  });
}

function process(res) {
  if (!res.alive) {
    login();
  }
  setTimeout(() => {
    newPing(host).then(process);
  }, 1000);
}

newPing(host).then(process);
