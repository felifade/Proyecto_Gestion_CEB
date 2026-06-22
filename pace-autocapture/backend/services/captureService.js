const { exec } = require('child_process');

const executeAppleScript = (script) => {
  return new Promise((resolve, reject) => {
    exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Strategy Pattern Interface (represented as a class on JavaScript)
class AppleScriptCaptureService {
  async capture(grades, delayMs) {
    console.log(`Starting capture process for ${grades.length} grades. Delay: ${delayMs}ms.`);
    
    for (let i = 0; i < grades.length; i++) {
      const { grade } = grades[i];
      
      // Command to keystroke the grade value followed by key code 48 (TAB)
      const script = `tell application "System Events"
        keystroke "${grade}"
        key code 48
      end tell`;
      
      await executeAppleScript(script);
      await sleep(delayMs);
    }
    return { success: true, count: grades.length };
  }
}

module.exports = new AppleScriptCaptureService();
