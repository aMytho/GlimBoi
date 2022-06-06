
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
                if ( // Check that it starts with the trigger
                    (context as incomingGlimeshMessage).message.toLowerCase().startsWith((command.triggers[0].constraints as ChatMessageTrigger).startsWith.toLowerCase())
                    && /* Check that the first word matches for extra security */ (context as incomingGlimeshMessage).message.split(" ")[0].toLowerCase() === (command.triggers[0].constraints as ChatMessageTrigger).startsWith.toLowerCase()
                ) {
                    return true;
                }
                break;
                case "Welcome User":
                    let usr = (command.triggers[0].constraints as WelcomeUserTrigger).user;
                    if (usr) {
                        usr = usr.toLowerCase();
                    }
                    if (!usr || (context.user.toLowerCase() == usr)) {
                        return true
                    }
                    break;
            case "Follow":
            case "Subscribe":
            case "Gift Sub":
            case "Donate":
                return true;
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
        case "Subscribe":
            return {user: {username: context.user}, trigger: trigger};
        case "Gift Sub":
            return {user: {username: context.user}, variables: {recipient: {username: context.recipient}}, trigger: trigger}
        case "Donate":
            return {user: {username: context.user}, variables: {donation: {amount: context.amount}}, trigger: trigger};
        // For any others you may have to provide the context items you need. Query usr ID, etc
    }
}

export {checkContext}