const sha1 = require("sha1");
const axios = require("axios");
const { md5, $ } = require("./ready.js");

const ip = "10.1.123.11";
const username = ""; // TODO change to yourself
const password = ""; // TODO change to yourself
const debugToken = "";

function useInfo(info, token) {
  console.log("userInfo:(info:", info, ",token:", token, ")");
  // 克隆自 $.base64，防止污染
  var base64 = $.base64;

  base64.setAlpha(
    "LVoJPiCN2R8G90yg+hmFHuacZ1OWMnrsSTXkYpUq/3dlbfKwv6xztjI7DeBE45QA"
  ); // 用户信息转 JSON

  info = JSON.stringify(info);
  console.log("info字符串：", info);

  function encode(str, key) {
    if (str === "") return "";
    var v = s(str, true);
    var k = s(key, false);
    if (k.length < 4) k.length = 4;
    var n = v.length - 1,
      z = v[n],
      y = v[0],
      c = 0x86014019 | 0x183639a0,
      m,
      e,
      p,
      q = Math.floor(6 + 52 / (n + 1)),
      d = 0;

    while (0 < q--) {
      d = (d + c) & (0x8ce0d9bf | 0x731f2640);
      e = (d >>> 2) & 3;

      for (p = 0; p < n; p++) {
        y = v[p + 1];
        m = (z >>> 5) ^ (y << 2);
        m += (y >>> 3) ^ (z << 4) ^ (d ^ y);
        m += k[(p & 3) ^ e] ^ z;
        z = v[p] = (v[p] + m) & (0xefb8d130 | 0x10472ecf);
      }

      y = v[0];
      m = (z >>> 5) ^ (y << 2);
      m += (y >>> 3) ^ (z << 4) ^ (d ^ y);
      m += k[(p & 3) ^ e] ^ z;
      z = v[n] = (v[n] + m) & (0xbb390742 | 0x44c6f8bd);
    }

    return l(v, false);
  }

  function s(a, b) {
    var c = a.length;
    var v = [];

    for (var i = 0; i < c; i += 4) {
      v[i >> 2] =
        a.charCodeAt(i) |
        (a.charCodeAt(i + 1) << 8) |
        (a.charCodeAt(i + 2) << 16) |
        (a.charCodeAt(i + 3) << 24);
    }

    if (b) v[v.length] = c;
    return v;
  }

  function l(a, b) {
    var d = a.length;
    var c = (d - 1) << 2;

    if (b) {
      var m = a[d - 1];
      if (m < c - 3 || m > c) return null;
      c = m;
    }

    for (var i = 0; i < d; i++) {
      a[i] = String.fromCharCode(
        a[i] & 0xff,
        (a[i] >>> 8) & 0xff,
        (a[i] >>> 16) & 0xff,
        (a[i] >>> 24) & 0xff
      );
    }

    return b ? a.join("").substring(0, c) : a.join("");
  }

  console.log("encode(info, token):", encode(info, token));
  const result = "{SRBX1}" + base64.encode(encode(info, token));
  console.log("userInfo的结果:", result);
  return result;
}

function login() {
  return (
    axios
      // 第一次请求，拿到token
      .get("http://login.hdu.edu.cn/cgi-bin/get_challenge", {
        params: {
          ip,
          username,
          _: new Date().getTime(),
          callback: "nothing",
        },
      })
      .then((res) => {
        console.debug("第一次请求完成");
        const data = JSON.parse(res.data.slice(8, -1));
        console.debug("get_challenge返回的数据:", data);
        const token = data.challenge;
        console.log("token:", token);
        return { token };
      })
      .then(({ token }) => {
        if (debugToken) {
          token = debugToken;
        }
        // 加密常量
        const type = 1;
        const n = 200;

        const ac_id = "";
        const hmd5 = md5(password, token);
        console.log("hmd5", hmd5);

        const i = useInfo(
          {
            username,
            password,
            ip: ip,
            acid: ac_id,
            enc_ver: "srun_bx1",
          },
          token
        );
        console.debug("i:", i);

        let str = token + username;
        str += token + hmd5;
        str += token + ac_id;
        str += token + ip;
        str += token + n;
        str += token + type;
        str += token + i; // 防止 IPv6 请求网络不通进行 try catch
        console.debug("sha1(str):", sha1(str));
        return axios.get("http://login.hdu.edu.cn/cgi-bin/srun_portal", {
          params: {
            action: "login",
            username: username,
            password: "{MD5}" + hmd5,
            os: "Mac OS",
            name: "Macintosh",
            double_stack: 0,
            chksum: sha1(str),
            info: i,
            ac_id: ac_id,
            ip: ip,
            n: n,
            type: type,
          },
        });
      })
      .then((res) => {
        console.log("成功！！！");
        console.log("res.data:", res.data);
      })
      .catch((err) => {
        console.error(err);
      })
  );
}

module.exports = login;
