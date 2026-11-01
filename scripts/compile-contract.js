/**
 * Compiles contracts/BEP20Token.sol into lib/contracts/BEP20Token.json
 * (ABI + bytecode), which the frontend imports statically to deploy the
 * contract directly from the connected wallet.
 *
 * Runs automatically via the "postinstall" script in package.json, so it
 * executes on Vercel right after `npm install` -- no manual step needed
 * once you push to GitHub. You can also run it locally at any time with:
 *
 *   npm run compile:contract
 */
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const CONTRACT_PATH = path.join(__dirname, "..", "contracts", "BEP20Token.sol");
const OUTPUT_PATH = path.join(__dirname, "..", "lib", "contracts", "BEP20Token.json");

function findImports(importPath) {
  const candidates = [
    path.join(__dirname, "..", "node_modules", importPath),
    path.join(__dirname, "..", importPath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { contents: fs.readFileSync(candidate, "utf8") };
    }
  }
  return { error: `File not found: ${importPath}` };
}

function main() {
  const source = fs.readFileSync(CONTRACT_PATH, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "BEP20Token.sol": { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode.object"] },
      },
    },
  };

  const rawOutput = solc.compile(JSON.stringify(input), { import: findImports });
  const output = JSON.parse(rawOutput);

  const errors = (output.errors || []).filter((e) => e.severity === "error");
  if (output.errors) {
    for (const e of output.errors) {
      console[e.severity === "error" ? "error" : "warn"](e.formattedMessage);
    }
  }
  if (errors.length > 0) {
    console.error("\nContract compilation failed. See errors above.");
    process.exit(1);
  }

  const contract = output.contracts["BEP20Token.sol"]["BEP20Token"];
  const artifact = {
    contractName: "BEP20Token",
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2));
  console.log(`Compiled BEP20Token -> ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
