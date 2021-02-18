# GlimBoi ![Imgur](https://i.imgur.com/EA37ok1s.png)

A chatbot for Glimesh.tv

> The bot is not yet ready for release. It will be released in beta shortly before Glimesh Launches.

## Setup
Download the bot from the [releases](https://github.com/aMytho/GlimBoi/releases) page.
Run the installer for your platform. Windows users can use the .exe file. Linux users can use the .deb file. Other platforms can build the app manually or use wine.

> Note that only Windows users can recieve automatic updates. 

Windows may display a warning. This is due to the lack of official licensing. Select run anyway. Choose an installation location and install the bot. 

## Login
GlimBoi uses oAuth to connect to the glimesh service. You must create a dev app to use GlimBoi. This allows for a *custom bot name.*
Go to https://glimesh.tv/users/settings/applications and make an application on the account with the desired name. Many users create a new account with the desired (bot) name. You can choose any name,description,image, and homepage. The redirect URI **MUST** match the one in the picture.

![Imgur](https://i.imgur.com/LOIJVyt.png)

Save the app. Copy the client ID and secret ID. *Keep these private!*

Go into Glimboi. Paste the client ID and secret ID in their respective inputs. Save the data and authorize the bot. This will open the page in your default browser. If you are not logged in beforehand GLimesh will ask you to sign in. Log in, then hit authorize again. You will then be able to accept your dev app. Glimboi is now ready to operate in your chat!


## Usage
GlimBoi has a basic GUI for interacting with the bot. You can create commands and manage users. You can also create a currency system for your viewers to spend points with. They can be used for games and trading. Your moderators can control basic functions of the bot. 


## Updates
Windows can recieve automatic updates. Other platforms must manually update. You can download any version of the bot from the releases page. If the platform you want is not supported you can manually build the bot from the source code. Your platform must support Electron. 
This is a work in progress.
