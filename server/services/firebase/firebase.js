// DEPRECATED: This CommonJS wrapper has been replaced by the TypeScript helper
// at `server/services/firebase/firebase.ts`. Do not require this file in new
// code. It remains here temporarily for compatibility but will throw if used.

module.exports = {
  initFirebase() {
    throw new Error(
      "Deprecated: import and use 'server/services/firebase/firebase.ts' (initFirebase) instead of this file."
    );
  },
};