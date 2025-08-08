// Utility functions for device management

export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  // Detect device type
  let deviceType = "desktop"
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) {
      deviceType = "tablet"
    } else {
      deviceType = "mobile"
    }
  }

  // Detect browser
  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  // Detect OS
  let os = "Unknown"
  if (platform.includes("Win")) os = "Windows"
  else if (platform.includes("Mac")) os = "macOS"
  else if (platform.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS"

  // Generate device name
  let deviceName = `${browser} on ${os}`
  if (deviceType === "mobile") deviceName = `${browser} Mobile`
  else if (deviceType === "tablet") deviceName = `${browser} Tablet`

  return {
    deviceType,
    browser,
    os,
    deviceName,
    userAgent,
  }
}

export const getUserLocation = async () => {
  try {
    // Using a free IP geolocation service
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    return `${data.city}, ${data.country_name}`
  } catch (error) {
    return "Unknown Location"
  }
}

export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
