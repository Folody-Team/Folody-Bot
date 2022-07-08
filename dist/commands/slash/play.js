"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("@Folody/messages");
const function_1 = require("@Folody/function");
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
exports.default = {
    name: 'play',
    description: 'Play command',
    type: discord_js_1.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'song_name',
            description: 'Enter the name or url of the song',
            type: 3,
            required: true,
        },
    ],
    init: async (folody, interaction) => {
        await interaction.deferReply();
        let server = function_1.servers.get(interaction.guildId);
        if (!server) {
            if (interaction.member instanceof discord_js_1.GuildMember && interaction.member.voice.channel) {
                const channel = interaction.member.voice.channel;
                server = new function_1.Core((0, voice_1.joinVoiceChannel)({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                }), interaction.guildId);
                function_1.servers.set(interaction.guildId, server);
            }
        }
        if (!server)
            return void interaction.followUp('Please join a voice channel and try again');
        try {
            await (0, voice_1.entersState)(server.voiceConnection, voice_1.VoiceConnectionStatus.Ready, 10e3);
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
            return void interaction.followUp('Could not connect to voice channel');
        }
        try {
            const input = interaction.options.get('song_name').value;
            const playListId = function_1.FolodyYoutube.isPlaylist(input);
            if (playListId) {
                const playlist = await function_1.FolodyYoutube.getPlaylist(playListId);
                const songs = playlist.songs.map((song) => {
                    const queueItem = {
                        song,
                        requester: interaction.member?.user.username,
                    };
                    return queueItem;
                });
                await server.addSongs(songs);
                if (server.queue.length === 0) {
                    await void interaction.followUp({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setColor('#34eb56')
                                .setTitle(playlist.title)
                                .setDescription(`${messages_1.messages.Status.title} \`${messages_1.messages.Status.type[0]}\``)
                        ]
                    });
                }
                else {
                    await void interaction.followUp(`Added ${playlist.title}`);
                }
            }
            else {
                const song = await function_1.FolodyYoutube.getVideoDetails(input);
                const queueItem = {
                    song,
                    requester: interaction.member?.user.username,
                };
                await server.addSongs([queueItem]);
                if (server.queue.length === 0) {
                    await void interaction.followUp({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setColor('#34eb56')
                                .setTitle(song.title)
                                .setDescription(`${messages_1.messages.Status.title} \`${messages_1.messages.Status.type[0]}\``)
                        ]
                    });
                }
                else {
                    await void interaction.followUp(`Added ${song.title}`);
                }
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
            return await void interaction.followUp('Could not play song');
        }
    }
};
//# sourceMappingURL=play.js.map