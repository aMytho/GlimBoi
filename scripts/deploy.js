const open = require('open');

const { extractOwnerAndRepoFromGitRemoteURL } = require('./util/extract');
const packageJSON = require('../package.json');
const { exec } = require('./util/exec');
const { COLORS } = require('./constants/colors');

async function makeRelease() {
    console.clear();

    const { version } = packageJSON
    console.log(`${COLORS.GREEN}Creating release for version ${version}${COLORS.RESET}`);

    try {
        console.log(`${COLORS.CYAN}> Trying to release it...${COLORS.RESET}`);

        exec(
            [
                `git commit -am v${version}`,
                `git tag v${version}`,
                `git push`,
                `git push --tags`,
            ],
            {
                inherit: true,
            }
        )

        const [repository] = exec([`git remote get-url --push origin`]);
        const ownerAndRepo = extractOwnerAndRepoFromGitRemoteURL(repository);

        console.log(
            `${COLORS.CYAN}> Opening the repository releases page...${COLORS.RESET}`
        );

        await open(`https://github.com/${ownerAndRepo}/releases`);

        console.log(
            `${COLORS.CYAN}> Opening the repository actions page...${COLORS.RESET}`
        );

        await open(`https://github.com/${ownerAndRepo}/actions`);

        console.log(`\n${COLORS.GREEN}Done!${COLORS.RESET}\n`)
    } catch ({ message }) {
        console.log(`
    🛑 Something went wrong!\n
      👀 Error: ${message}
    `);
    }
}

makeRelease();