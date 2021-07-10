# GlimBoi Contributing

Thanks for wanting to help out with the bot. Here are a few things that you will need to get the bot to run.

 - [NodeJS]([Node.js](https://nodejs.org/en/))
 - Any IDE ex. [VScode]([Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com/))
 - General JS/CSS/HTML knowledge. Having experience with Electron would be helpful.

## Contributing to the Bot

Anyone can contribute to the bot. Use the following instructions to begin contributing.

1. **Fork the repo.**  Start by creating a fork.  Download the fork to your PC.
2. **Create a new branch.** Create a new branch titled the name of the feature you are adding. You can have multiple features per branch but you must document any changes.
3. **Install npm packages.** In your terminal run `npm install` . Then run `npm install electron -g` . Then, run `npm ts` to build the js files required. If build/main.js does not exist you need to compile main.ts(root dir) and move it there manually. When all the files are generated you can run `npm start` to launch glimboi.
4. **Make your changes.** In a new terminal window run `npm run dev`. This will automatically compile ts files to js when you save them. You will have to press ctrl+r in Glimboi to make the bot use the new files. Note that if you only plan on changing html/css files the you can simply press the name of the tab of the page in glimboi. It loads the html file newly each time. Add the new feature or bug fix. If you need help or ideas you can make an issue on our github page.
5. **Make a pull request.**  When you have made all the changes submit a pull request. Merge your new feature branch into the ts branch on the repo. We may ask for changes or we will merge it to begin testing. If everything works as expected it will be merged to the main branch.

Thank you for contributing!
