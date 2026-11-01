---
'expo-release-it': major
---

Encrypt release credentials by default with EXPO_RELEASE_IT_ENCRYPTION_KEY from the environment or an env file. Existing init, build, upload, submit, and pull commands manage encryption and temporary decryption automatically, including importing legacy plaintext credentials and replacement key files. Init can request the key interactively. Signed builds and store commands require the encryption key; unsigned iOS builds and version bumps remain credential-free.
