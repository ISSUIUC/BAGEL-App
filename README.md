# Welcome to the GitHub repo for the Bagel App!


This app has been written in Svelte Native, which involves writing the app in Svelte code, largely similar to Svelte used for webpaegs.
However, instead of using HTML DOM elements, we use NativeScript elements.

## Building for Android

Setup:
1. Clone the repo locally.
2. Run `npm intall` to install everything necessary.
3. Run `npm install -g nativescript`
4. Run `npm install @nativescript/theme`
5. Run `rbenv install 3.3.6`
6. Run `rbenv global 3.3.6`
7. Run `echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc`
8. Run `source ~/.zshrc`
9. Run `ruby -v` (should say 3.3.6)
10. Run `gem install ffi -v 1.17.3`
11. Run `gem update --system 4.0.8`
12. Run `sudo gem install cocoapods`

Building the app on IOS:
1. Run `open platforms/ios/BAGELApp.xcodeproj`
2. Within Xcode window click ‘BagelAPP’ with blue square next to it, click ‘Signing & Capabilities’ from the bar on the screen, give new name in Bundle Identifier (ex: ‘com.name.bagelapp’)
3. Look above at the Team and add your apple account.
4. First, connect your IOS device via USB to your computer.
5. On the top of xcode search bar select your device.
6. Click play button on xcode.
7. Run `ns run ios`
8. On phone settings go to Device Management and trust yourself
9. Go to privacy and security within settings and scroll down to developer mode and turn that on
10. Open bagel app on your phone and enable bluetooth in phone settings for Bagel.


If you have any questions, ask Melody and Alyssa.

Alternatively, ask our good friend Claude.