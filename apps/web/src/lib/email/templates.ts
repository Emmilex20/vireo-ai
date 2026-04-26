export function welcomeEmail(name?: string) {
  return `
    <h2>Welcome to Vireon AI</h2>
    <p>${name || "Creator"}, start generating amazing images and videos.</p>
  `;
}

export function creditsLowEmail() {
  return `
    <h3>You're running low on credits</h3>
    <p>Top up or subscribe to continue creating.</p>
  `;
}

export function exportReadyEmail(url: string) {
  return `
    <h3>Your video is ready</h3>
    <p>Your final export is complete.</p>
    <a href="${url}">Watch your final export</a>
  `;
}

export function generationFailedEmail() {
  return `
    <h3>Generation failed</h3>
    <p>Your credits have been refunded. Try again.</p>
  `;
}
