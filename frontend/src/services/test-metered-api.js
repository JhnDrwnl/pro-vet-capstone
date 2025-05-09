// Enhanced test script for Metered API connectivity (ES Module version)
import https from "https"
import dns from "dns"
import { promisify } from "util"

// Convert DNS resolve to promise-based
const resolve4 = promisify(dns.resolve4)

async function testMeteredApiConnectivity() {
  console.log("=== Metered API Connectivity Test ===\n")

  // Step 1: DNS resolution test
  console.log("Step 1: Testing DNS resolution for innovet.metered.live...")
  try {
    const addresses = await resolve4("innovet.metered.live")
    console.log(`✅ DNS resolution successful: ${addresses.join(", ")}`)
  } catch (error) {
    console.error(`❌ DNS resolution failed: ${error.message}`)
    console.log("This suggests a DNS issue. Check your DNS settings or try using a different DNS server.")
    return
  }

  // Step 2: Basic connectivity test with timeout control
  console.log("\nStep 2: Testing basic connectivity to Metered API...")

  const apiUrl = "https://innovet.metered.live/api/v1/turn/credentials?apiKey=16a547dde1715402963d727fff0cef2fef39"
  const startTime = Date.now()

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.get(apiUrl, { timeout: 10000 }, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
          })
        })
      })

      req.on("error", (error) => {
        reject(error)
      })

      req.on("timeout", () => {
        req.destroy()
        reject(new Error("Request timed out after 10 seconds"))
      })

      // Set a timeout for the entire request
      setTimeout(() => {
        req.destroy()
        reject(new Error("Request timed out after 10 seconds"))
      }, 10000)
    })

    const responseTime = Date.now() - startTime
    console.log(`✅ Connection successful (${responseTime}ms)`)
    console.log(`Status code: ${response.statusCode}`)

    if (response.statusCode !== 200) {
      console.error(`❌ API returned non-200 status code: ${response.statusCode}`)
      console.log(`Response headers: ${JSON.stringify(response.headers, null, 2)}`)
      return
    }

    // Step 3: Parse and validate the response
    console.log("\nStep 3: Validating API response...")
    try {
      const data = JSON.parse(response.data)

      if (!Array.isArray(data)) {
        console.error("❌ API response is not an array as expected")
        console.log(`Actual response: ${response.data.substring(0, 200)}...`)
        return
      }

      console.log(`✅ Received ${data.length} ICE servers`)

      // Check for TURN servers with credentials
      const turnServers = data.filter(
        (server) =>
          server.urls &&
          (Array.isArray(server.urls)
            ? server.urls.some((url) => url.includes("turn:"))
            : server.urls.includes("turn:")) &&
          server.username &&
          server.credential,
      )

      console.log(`Found ${turnServers.length} TURN servers with credentials`)

      if (turnServers.length === 0) {
        console.warn("⚠️ No TURN servers with credentials found in the response!")
        console.log("This may indicate an issue with your Metered API key or account.")
      } else {
        console.log("✅ TURN servers with credentials found")

        // Print first TURN server details (with credential partially masked)
        if (turnServers.length > 0) {
          const server = turnServers[0]
          const maskedCredential = server.credential
            ? server.credential.substring(0, 3) +
              "..." +
              (server.credential.length > 6 ? server.credential.substring(server.credential.length - 3) : "")
            : "none"

          console.log("\nSample TURN server:")
          console.log(`URLs: ${JSON.stringify(server.urls)}`)
          console.log(`Username: ${server.username}`)
          console.log(`Credential: ${maskedCredential} (partially masked)`)
        }
      }
    } catch (error) {
      console.error(`❌ Failed to parse API response: ${error.message}`)
      console.log(`Raw response: ${response.data.substring(0, 200)}...`)
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Connection failed after ${responseTime}ms: ${error.message}`)

    if (error.message.includes("timeout")) {
      console.log("\nPossible causes of timeout:")
      console.log("1. Network congestion or high latency")
      console.log("2. Firewall or proxy blocking the connection")
      console.log("3. Metered API service might be experiencing issues")
      console.log("4. Your API key might be invalid or rate-limited")
    }

    if (error.code === "ENOTFOUND") {
      console.log("\nThe hostname could not be resolved. Check your DNS settings.")
    }

    if (error.code === "ECONNREFUSED") {
      console.log("\nConnection refused. The server might be down or blocking your requests.")
    }
  }

  // Step 4: Provide recommendations
  console.log("\nStep 4: Recommendations")
  console.log("If you're experiencing issues:")
  console.log("1. Verify your Metered API key is correct and active")
  console.log("2. Check if your network allows HTTPS connections to external services")
  console.log("3. Try using a fallback set of ICE servers if Metered API is unreachable")
  console.log("4. Consider upgrading your Metered plan if you're hitting usage limits")

  console.log("\n=== Test Complete ===")
}

testMeteredApiConnectivity()
