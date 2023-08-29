var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "discord.js", "path", "../function/Music", "../media/Player"], function (require, exports, discord_js_1, path_1, Music_1, Player_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    path_1 = __importDefault(path_1);
    /**
     *
     * @param url
     * @param queue
     * @param music
     * @param guild
     * @param channel
     * @param gateway
     */
    function musicPlay(url, queue, music, guild, channel, gateway) {
        music.api.download(url).then(stream => {
            const player = Player_1.Player.create(stream, (queue === null || queue === void 0 ? void 0 : queue.voice).udp);
            player.once('spawnProcess', () => {
                // làm j có event này
                queue === null || queue === void 0 ? void 0 : queue.voice.setSpeaking(true);
            });
            player.once('finish', () => {
                queue === null || queue === void 0 ? void 0 : queue.voice.setSpeaking(false);
                if ((queue === null || queue === void 0 ? void 0 : queue.data.length) == 1 && !(queue.loop == Music_1.LoopType.Queue || queue.loop == Music_1.LoopType.Song)) {
                    player.stop();
                    queue === null || queue === void 0 ? void 0 : queue.data.splice(0, queue === null || queue === void 0 ? void 0 : queue.data.length);
                    queue === null || queue === void 0 ? void 0 : queue.voice.shard.close();
                    // queue?.voice.udp.udp.disconnect();
                    music.data.delete(guild);
                }
                else if (queue.loop == Music_1.LoopType.Queue || queue.loop == Music_1.LoopType.None) {
                    const lastQueueSong = queue === null || queue === void 0 ? void 0 : queue.data.shift();
                    if (queue.loop == Music_1.LoopType.Queue) {
                        if (lastQueueSong)
                            queue.data.push(Object.assign({}, lastQueueSong));
                    }
                    ;
                    musicPlay(queue === null || queue === void 0 ? void 0 : queue.data[0].url, queue, music, guild, channel, gateway);
                }
                else if (queue.loop == Music_1.LoopType.Song) {
                    musicPlay(queue === null || queue === void 0 ? void 0 : queue.data[0].url, queue, music, guild, channel, gateway);
                }
                else {
                    console.log(queue.loop);
                }
            });
            player.play();
        });
    }
    exports.default = {
        data: new discord_js_1.SlashCommandBuilder()
            .setName(path_1.default.basename(__filename).replace(/\.[^/.]+$/, ""))
            .setDescription('Play music')
            .addStringOption(option => option.setName('input').setDescription('Enter url').setRequired(true)),
        /**
         *
         * @param interaction
         * @param music
         * @param client
         * @returns
         */
        exe: (interaction, music, client) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const url = interaction.options.getString('input');
            if (!(url === null || url === void 0 ? void 0 : url.match(/^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/))) {
                return yield interaction.reply('You must enter soundcloud link!');
            }
            const guild = interaction.guildId;
            const channel = (_c = (_b = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(interaction.member.user.id)) === null || _b === void 0 ? void 0 : _b.voice.channel) === null || _c === void 0 ? void 0 : _c.id;
            const gateway = (_d = client.guilds.cache.get(guild)) === null || _d === void 0 ? void 0 : _d.shard;
            if (!music.data.has(guild)) {
                music.createQueue(guild);
                yield music.addSong(guild, url);
                const queue = music.data.get(guild);
                gateway.send({
                    op: 2 << 1,
                    d: {
                        guild_id: guild,
                        channel_id: channel,
                        self_mute: false,
                        self_deaf: true,
                    }
                });
                const playing = queue.data[0];
                client.on(discord_js_1.Events.Raw, (packet) => {
                    var _a;
                    if (packet.t == 'VOICE_STATE_UPDATE') {
                        queue === null || queue === void 0 ? void 0 : queue.voice.session(packet.d.session_id);
                    }
                    if (packet.t == 'VOICE_SERVER_UPDATE') {
                        queue === null || queue === void 0 ? void 0 : queue.voice.init(guild, (_a = client.user) === null || _a === void 0 ? void 0 : _a.id, packet.d.token);
                        queue === null || queue === void 0 ? void 0 : queue.voice.connect(`wss://${packet.d.endpoint}/?v=4`);
                        musicPlay(playing.url, queue, music, guild, channel, gateway);
                    }
                });
                yield interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setTitle(playing.info.title)
                            .setDescription(`${playing.info.description[0].match(/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/) ? `\\${playing.info.description}` : playing.info.description}`)
                    ]
                });
            }
            else {
                const song = yield music.addSong(guild, url);
                const queue = music.data.get(guild);
                if ((queue === null || queue === void 0 ? void 0 : queue.data.length) == 0) {
                    gateway.send({
                        op: 2 << 1,
                        d: {
                            guild_id: guild,
                            channel_id: channel,
                            self_mute: false,
                            self_deaf: true,
                        }
                    });
                    const playing = queue.data[0];
                    client.on(discord_js_1.Events.Raw, (packet) => {
                        var _a;
                        if (packet.t == 'VOICE_STATE_UPDATE') {
                            queue === null || queue === void 0 ? void 0 : queue.voice.session(packet.d.session_id);
                        }
                        if (packet.t == 'VOICE_SERVER_UPDATE') {
                            queue === null || queue === void 0 ? void 0 : queue.voice.init(guild, (_a = client.user) === null || _a === void 0 ? void 0 : _a.id, packet.d.token);
                            queue === null || queue === void 0 ? void 0 : queue.voice.connect(`wss://${packet.d.endpoint}/?v=4`);
                            musicPlay(playing.url, queue, music, guild, channel, gateway);
                        }
                    });
                    yield interaction.reply({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setTitle(playing.info.title)
                                .setDescription(`${playing.info.description[0].match(/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/) ? `\\${playing.info.description}` : playing.info.description}`)
                        ]
                    });
                }
                else {
                    yield interaction.reply(`Added **${song}**`);
                }
            }
        })
    };
});
