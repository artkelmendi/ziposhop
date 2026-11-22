export const consentKey = "zipo:privacy-choice";
export const introKey = "zipo:intro-seen";
const lifetime = 180 * 24 * 60 * 60 * 1000;

export function readPrivacyChoice() {
  try {
    const value = JSON.parse(localStorage.getItem(consentKey));
    if (value?.version === 1 && typeof value.preferences === "boolean" &&
      Number.isFinite(value.savedAt) && value.savedAt <= Date.now() &&
      value.expiresAt === value.savedAt + lifetime && value.expiresAt > Date.now()) return value;
  } catch { /* Private browsing can disable storage. The defaults stay private. */ }
  return null;
}

export function displayPreferencesAllowed() {
  return readPrivacyChoice()?.preferences === true;
}

export function savePrivacyChoice(preferences) {
  const savedAt = Date.now();
  const choice = { version: 1, preferences, savedAt, expiresAt: savedAt + lifetime };
  try { localStorage.setItem(consentKey, JSON.stringify(choice)); } catch { /* Remember in memory for this visit. */ }
  syncDisplayPreference(preferences);
  return choice;
}

export function syncDisplayPreference(preferences) {
  try {
    if (preferences) sessionStorage.setItem(introKey, "1");
    else sessionStorage.removeItem(introKey);
  } catch { /* Optional preferences never block navigation. */ }
}
