// export async function prepareIos() {
//   await spinner('Prebuild iOS', () => $`expo prebuild -p ios --no-install`);
//   await remove('ios/fastlane');
//   await iterateDir('fastlane-ios', async (file) => {
//     const filePath = resolve('fastlane-ios', file);
//     await $`rm -rf ios/${file} && cp -r ${filePath} ios/${file}`;
//   });
//   printSuccess('Inject iOS Fastlane files');
// }
