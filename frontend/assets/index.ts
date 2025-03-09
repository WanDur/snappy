/**
 * THIS FILE IS AUTO GENERATED from (scripts/register-assets.js)
 * If new assets are added, run "npm run register-assets" in your terminal
 */
const assets = {
  "fonts": {
    "SpaceMono-Regular": require('./fonts/SpaceMono-Regular.ttf')
  },
  "images": {
    "adaptive-icon": require('./images/adaptive-icon.png'),
    "icon": require('./images/icon.png'),
    "splash-icon": require('./images/splash-icon.png')
  }
}

/**
 * use this function to get all assets registered to the app
 * 
 * @example source={getAssetes('images').logo512}
 */
export const getAssets = <T extends keyof typeof assets>(assetType: T) => {
    return assets[assetType]
}
