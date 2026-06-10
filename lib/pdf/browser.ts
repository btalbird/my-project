import chromium from "@sparticuz/chromium"
import puppeteer, { type Browser } from "puppeteer-core"

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

export async function launchBrowser(): Promise<Browser> {
  if (IS_SERVERLESS) {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const localExecutable =
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    process.env.CHROME_PATH ??
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : undefined)

  if (localExecutable) {
    return puppeteer.launch({
      executablePath: localExecutable,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  }

  const bundled = await import("puppeteer")
  return bundled.default.launch({ headless: true })
}
