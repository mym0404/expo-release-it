---
'expo-release-it': major
---

Require EXPO_RELEASE_IT_ENCRYPTION_KEY from the environment or an env file for every command, including init, bump, and unsigned builds. Missing or too-short keys stop execution before project changes; the CLI never prompts for or generates a replacement key. Existing commands manage encrypted credential storage and temporary decryption automatically, importing legacy plaintext credentials and replacement key files only after key validation.
