import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Executes a shell command and returns a promise that resolves when the command completes.
 */
const runCommand = (command, args, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    const cmdStr = `${command} ${args.join(" ")}`;
    console.log(`\n> Running: ${cmdStr}`);

    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${cmdStr}" failed with exit code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
};

const main = async () => {
  console.log("🚀 Starting Notip Project Setup...");
  const rootDir = process.cwd();

  try {
    // 1. Install Dependencies
    // We check for node_modules to avoid re-installing if not needed,
    // but running install is generally safe and ensures sync with lockfile.
    console.log("📦 Checking dependencies...");
    if (!existsSync(join(rootDir, "node_modules"))) {
      console.log("   node_modules not found. Installing...");
      await runCommand("yarn", ["install"]);
    } else {
      console.log("   node_modules exists. Ensuring sync...");
      await runCommand("yarn", ["install", "--check-files"]);
    }

    // 2. Build the Library
    console.log("🏗️  Building library...");
    await runCommand("yarn", ["run", "build"]);

    // 3. Typecheck
    console.log("🛡️  Running type check...");
    await runCommand("yarn", ["run", "typecheck"]);

    console.log("\n✨ Setup successfully completed!");
    console.log("-----------------------------------");
    console.log("You are ready to go. Available commands:");
    console.log("  yarn run storybook   -> Start Storybook for development");
    console.log("  yarn run test        -> Run tests");
    console.log("  yarn run dev         -> Build library in watch mode");
    console.log("-----------------------------------");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
};

main();
