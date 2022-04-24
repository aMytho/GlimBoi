
/**
 * Checks the command trigger and executes the command (constraints allowing)
 */
async function checkContext(trigger:CommandTrigger, context) {
    // Get all the commands with the matching trigger
    let commands = await CommandHandle.findByTrigger(trigger);
    // Loop through them. Check their constraints. Remove any that fail the check.
    commands = commands.filter(command => {
        switch(command.triggers[0].trigger) {
            case "ChatMessage":
                if (
                    (context as incomingGlimeshMessage).message.startsWith((command.triggers[0].constraints as ChatMessageTrigger).startsWith)
                ) {
                    return true;
                }
                break;
            case "Follow":
                break;
            case "Welcome User":
                let usr = (command.triggers[0].constraints as WelcomeUserTrigger).user;
                if (!usr || (context.user == (command.triggers[0].constraints as WelcomeUserTrigger).user)) {
                    return true
                }
                break;
            default:
                break;
        }
    });
    // Run any commands that remain
    context = parseContext(trigger, context);
    commands.forEach(command => CommandHandle.CommandRunner.checkCommand(command, context));
}

/**
 * Parses context and gives it the correct values the command function expects
 * @returns
 */
function parseContext(trigger: CommandTrigger, context:any):TriggerContext {
    switch(trigger) {
        case "ChatMessage":
            return {message: context.message, user: context.user, trigger: trigger, messageId: context.id};
        case "Follow":
            return {user: {username: context.user}, message: context.message, trigger: trigger};
        case "Welcome User":
            return {user: {username: context.user}, trigger: trigger};
        // For any others you may have to provide the context items you need. Query usr ID, etc
    }
}

export {checkContext}