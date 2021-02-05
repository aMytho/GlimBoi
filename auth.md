## Getting Started

GlimBoi requires authentication to talk as a bot/streamer account. You need to create a dev application. If you are in GlimBoi select "create bot" on the homepage. Otherwise, go [here](https://glimesh.tv/users/settings/applications). Create an app. The values can be whatever you want except for the redirect URIs. It should look like this.  ![Imgur](https://i.imgur.com/LOIJVyt.png)

Redirect URL :  http://localhost:3000/success
This allows the bot to retrieve the auth token properly. When you save the app it will give you a client ID and a secret ID. Paste them in their corresponding places on the GlimBoi homepage. Select "Save Auth" to save the keys. Then press "Authenticate". This will start a server and open your browser to an auth page. 
> Note that some antivirus software may block this. You may need to allow GlimBoi to run on your network. 
>  If you are not logged in when the browser redirects you a login will be required. Then, leaving the browser open press authenticate again. It will send you to the correct page. 

Select "Authorize". Your app will look similar but will require less permissions. 
![Imgur](https://i.imgur.com/fWawNSS.png)

GlimBoi will receive the authorization and will send you to a page telling you everything succeeded. GlimBoi will display a notification in the app to confirm this. 

Congratulations - You have completed the auth process!
You can now use GlimBoi to its full potential. This process may be updated before the official release. 
> Note that the auth received will last for 6 hours. To refresh it, simply press the GlimBoi text on the nav bar. It will request a new token without creating an auth server. 
