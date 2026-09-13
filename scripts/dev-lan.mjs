/**
 * LAN HTTPS dev entry for phone/PWA testing.
 *
 * Run with `npm run dev:https:lan`. Resolves the machine's LAN IPv4, points
 * `BASE_URL`, `NEXTAUTH_URL`, and `AUTH_URL` at `https://<lan-ip>:<port>` for
 * the child process only (`.env` is never mutated), then starts
 * `next dev --turbo --experimental-https`.
 *
 * Why the overrides: Auth.js resolves relative sign-in targets
 * (`redirectTo`/`callbackUrl: "/"`) against its base URL, and the root layout
 * bakes `BASE_URL` into the canonical/OG metadata. With the committed
 * `http://localhost:3000` values, signing in from a phone redirects the
 * phone to its own localhost. Pointing both at the LAN URL keeps auth and
 * metadata on the phone's host.
 *
 * Certificates: Chrome refuses service-worker registration against a cert it
 * does not trust, so the script serves `certificates/lan.pem` (with the LAN
 * IP in its SANs, issued by the machine mkcert CA) via Next's
 * `--experimental-https-key/cert` flags, regenerating it with mkcert when it
 * is missing or the IP changed. One-time phone step: copy the printed CA
 * file to the phone and install it as a CA certificate (Android: Settings →
 * Security → Install CA certificate); without that trust the worker fails
 * with `SecurityError ... when fetching the script` and Chrome only offers
 * a plain shortcut instead of "Install app".
 *
 * Flags: `--host=<ip>` to pin an address, `--port=<n>` (default `PORT` env
 * or 3000), `--sw` to also register the service worker in dev (required for
 * Chrome to offer "Install app" instead of a plain shortcut;
 * `npm run dev:https:lan:sw`), `--cert=<path>` + `--key=<path>` to serve an
 * explicit pair, `--no-cert` to fall back to Next's generated certificate,
 * `--print-only` to resolve and print without starting Next.
 * Credentials login works over LAN; Google/GitHub OAuth still needs a
 * registered LAN callback URI in the provider console.
 */

import { execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const VIRTUAL_IFACE =
  /wsl|docker|veth|virtual|hyper-v|vmware|virtualbox|vpn|tailscale|hamachi|vethernet/i;

const MKCERT_BINARY = /^mkcert.*\.exe$/i;

function rank(address) {
  if (address.startsWith("192.168.")) {
    return 0;
  }
  if (address.startsWith("10.")) {
    return 1;
  }
  const third = Number(address.split(".")[2]);
  if (address.startsWith("172.") && third >= 16 && third <= 31) {
    return 2;
  }
  return 3;
}

function selectLanIp(interfaces, override) {
  if (override) {
    return override;
  }
  const all = [];
  for (const [name, list] of Object.entries(interfaces)) {
    for (const net of list ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        all.push({ address: net.address, name });
      }
    }
  }
  const physical = all.filter(({ name }) => !VIRTUAL_IFACE.test(name));
  const candidates = physical.length > 0 ? physical : all;
  candidates.sort((a, b) => rank(a.address) - rank(b.address));
  return candidates[0]?.address;
}

function getFlag(name) {
  const prefix = `--${name}=`;
  return process.argv
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

const LAN_KEY = path.join(root, "certificates", "lan-key.pem");
const LAN_CERT = path.join(root, "certificates", "lan.pem");

function findMkcert() {
  const dir = path.join(process.env.LOCALAPPDATA ?? "", "mkcert");
  try {
    const hit = readdirSync(dir).find((file) => MKCERT_BINARY.test(file));
    if (hit) {
      return { binary: path.join(dir, hit), ca: path.join(dir, "rootCA.pem") };
    }
  } catch {
    // No local mkcert directory; fall through to PATH lookup.
  }
  return { binary: "mkcert", ca: null };
}

function certCoversHost(certPath, host) {
  try {
    const out = execFileSync(
      "openssl",
      ["x509", "-in", certPath, "-noout", "-ext", "subjectAltName"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    return out.includes(host);
  } catch {
    return false;
  }
}

function ensureLanCert(host) {
  if (process.argv.includes("--no-cert")) {
    return null;
  }
  const keyFlag = getFlag("key");
  const certFlag = getFlag("cert");
  if (keyFlag ?? certFlag) {
    if (!(keyFlag && certFlag)) {
      console.error("dev-lan: --cert and --key must be passed together.");
      process.exit(1);
    }
    return { cert: certFlag, key: keyFlag, ca: null };
  }
  if (
    existsSync(LAN_CERT) &&
    existsSync(LAN_KEY) &&
    certCoversHost(LAN_CERT, host)
  ) {
    return { cert: LAN_CERT, key: LAN_KEY, ca: findMkcert().ca };
  }
  const { binary, ca } = findMkcert();
  try {
    execFileSync(
      binary,
      [
        "-key-file",
        LAN_KEY,
        "-cert-file",
        LAN_CERT,
        "localhost",
        "127.0.0.1",
        "::1",
        host,
      ],
      { cwd: root, stdio: ["ignore", "pipe", "inherit"] }
    );
    console.log(`dev-lan: issued LAN certificate for ${host}`);
    return { cert: LAN_CERT, key: LAN_KEY, ca };
  } catch {
    console.log(
      "dev-lan: no mkcert binary found, serving Next's generated certificate — " +
        "service-worker registration on the phone will fail; install mkcert or pass --cert/--key."
    );
    return null;
  }
}

const host = selectLanIp(os.networkInterfaces(), getFlag("host"));
if (!host) {
  console.error(
    "dev-lan: no non-internal IPv4 address found; pass --host=<ip>."
  );
  process.exit(1);
}

const port = Number(getFlag("port") ?? process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  console.error(
    `dev-lan: invalid port "${getFlag("port") ?? process.env.PORT}".`
  );
  process.exit(1);
}

const lanUrl = `https://${host}:${port}`;
const withWorker = process.argv.includes("--sw");
const lanCert = ensureLanCert(host);

console.log(`dev-lan: LAN URL      ${lanUrl}`);
console.log(
  "dev-lan: overrides    BASE_URL, NEXTAUTH_URL, AUTH_URL (child process only)"
);
console.log(
  `dev-lan: service wk.  ${withWorker ? "registered (NEXT_PUBLIC_SW_IN_DEV=1)" : "disabled (pass --sw for install testing)"}`
);
if (lanCert) {
  console.log(`dev-lan: certificate  ${lanCert.cert}`);
  if (lanCert.ca) {
    console.log(
      `dev-lan: phone trust  install ${lanCert.ca} on the phone as a CA certificate (one-time)`
    );
  }
} else {
  console.log("dev-lan: certificate  Next.js generated (untrusted on phones)");
}

if (process.argv.includes("--print-only")) {
  console.log(`dev-lan: BASE_URL=${lanUrl}`);
  process.exit(0);
}

console.log(
  "dev-lan: install the printed CA on the phone (one-time); until then, accept the browser cert warning."
);

const nextArgs = [
  path.join(root, "node_modules", "next", "dist", "bin", "next"),
  "dev",
  "--turbo",
  "--experimental-https",
  "-p",
  String(port),
];
if (lanCert) {
  nextArgs.push(
    "--experimental-https-key",
    lanCert.key,
    "--experimental-https-cert",
    lanCert.cert
  );
}

const child = spawn(process.execPath, nextArgs, {
  cwd: root,
  env: {
    ...process.env,
    AUTH_URL: lanUrl,
    BASE_URL: lanUrl,
    NEXTAUTH_URL: lanUrl,
    ...(withWorker ? { NEXT_PUBLIC_SW_IN_DEV: "1" } : {}),
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
