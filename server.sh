# This file runs the server of GlimBoi. It requires NodeJS to run. It is free and avaible here: https://nodejs.org/en/ 
# I would get the newest LTS version for the best results.
# For Devs: This is not packaged in the electron packager. It just navigates to the server file (which is in the electron files) and uses the node module folder there.
# That is why we don't have to run npm install. Questions? Create an Issue on Github or talk to me during one of my streams at Glimesh.tc/Mytho
cd resources
cd app
cd chatbot
echo "To stop the bot close this window. Enjoy!"
node glimbot
# This will keep the window open