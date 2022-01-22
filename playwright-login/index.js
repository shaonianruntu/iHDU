const ping = require("ping");
const { chromium } = require("playwright");
const host = "www.baidu.com";

function newPing(host) {
  return ping.promise.probe(host).then(function (res) {
    console.log(
      res.alive ? "host " + host + " is alive" : "host " + host + " is dead"
    );
    return res;
  });
}

const login = async () => {
  const browser = await chromium.launch();
  console.log("browser launched");
  const page = await browser.newPage();
  console.log("page created");
  await page.goto("http://login.hdu.edu.cn/");
  console.log("arrive the page");
  await page.fill("#username", "[]"); // TODO change [] to your username
  await page.fill("#password", "[]"); // TODO change [] to your passwd
  await page.click("#login-account");
  console.log("over");
};

function processResult(res) {
  if (!res.alive) {
    login();
  }
  setTimeout(() => {
    newPing(host).then(processResult);
  }, 2000);
}

newPing(host).then(processResult);
