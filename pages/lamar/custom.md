---
name: Custom Commands
---

# Custom Commands

Lamar has support for custom commands which are written in JavaScript.

## Helper Objects/Methods

The following helper functions are available to use in your custom commands:

- `interaction` - The interaction object (includes `user`, `channel`, `guild`, `options`).
- `console.log(...args)` - Logs a message to the console (in this case a Discord message).
- `sendMessage(options)` - Sends a message to the channel the command was executed in.
- `getUser(userId)` - Gets a user by their ID.
- `getServer()` - Gets the server the command was executed in.
- `getChannel(channelId)` - Gets a channel by its ID.
- `addRole(userId, roleId)` - Adds a role to a user.
- `removeRole(userId, roleId)` - Removes a role from a user.
- `kickMember(userId)` - Kicks a user from the server.
- `banMember(userId)` - Bans a user from the server.
- `moveMember(userId, channelId)` - Moves a user to a voice channel.
- `muteMember(userId)` - Mutes a user in a voice channel.
- `unmuteMember(userId)` - Unmutes a user in a voice channel.
- `clearMessages(count)` - Deletes a number of messages from the channel the command was executed in.
- `updateChannelName(name)` - Updates the name of the channel the command was executed in.
- `updateChannelTopic(topic)` - Updates the topic of the channel the command was executed in.
- `addReaction(messageId, emoji)` - Adds a reaction to a message.

## Examples

```js
const server = await getServer();

const msg = await sendMessage({
    content: `Hello, ${interaction.user.username}!`,
    embeds: [
        {
            title: server.name,
            description: `This server has a total of ${server.memberCount} members.\nThe owner is <@${server.ownerID}>.\nIt was created on ${server.createdAt}.`,
            color: 0x0099ff
        }
    ],
    buttons: [
        {
            label: "Button 1",
            url: "https://example.com"
        },
        {
            label: "Button 2",
            url: "https://example.com"
        }
    ],
    attachments: [
        {
            path: interaction.user.avatar,
            name: "avatar.png"
        }
    ]
});

await addReaction(msg, "👍");
```
