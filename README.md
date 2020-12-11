# GlimBoi
A chatbot for Glimesh.tv

## Setup
Download the bot from the releases page.
Run the installer for your platform. Windows users can use the .exe file. Mac and Linux users can use Wine or build the app manually.

## Login
GlimBoi uses oAuth to connect to the glimesh service. You must create a dev app to use GlimBoi. This allows for a *custom bot name.*
Go to https://glimesh.tv/users/settings/applications and make an application on the account with the desired name. Many users create a new account with the desired (bot) name. This is where the app needs to be created. 

### Name

## GUI
This is the normal mode for the bot. This is a user interface which you use to link your bot to chat and manage commands, quotes, and users.
You can connect the bot to chat using the GUI but it is not the recomended option.

## Server Mode
This mode was created with resources in mind. The GUI is great for managing the bot but it uses Electron. Electron is built on Chromimum which uses a lot of resources. To combat this I created server mode. This is a non UI mode. The bot will be running in the background without any GPU overhead. It uses minimil resources and has the same functionnality of the GUI. You must install [Node JS](https://nodejs.org) for this mode to work.

## What do I use?
Create your bot in the GUI mode. When you are ready to stream switch to server mode. All your changes will be saved and this will save you a ton of resources!

## Updates
Windows can recieve automatic updates. Other platforms must manually update. You can download any version of the bot from the releases page. Copy and paste the contents of the DB folder in the new directory if you manually updated the bot.
This is a work in progress.

## Platforms
This works on Windows, Linux (deb), and Mac. Some platforms have restrictions so you may want to use WINE if not on Windows. Windows will always be the main platform followed by Linux and finally Mac.
