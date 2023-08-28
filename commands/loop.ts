import { ChatInputCommandInteraction, Client, SlashCommandBuilder, WebSocketShard } from "discord.js";
import path from "path"
import { LoopType, Music } from "../function/Music";

export default {
    data: new SlashCommandBuilder()
        .setName(path.basename(__filename).replace(/\.[^/.]+$/, ""))
        .setDescription('Loop music')
        .addStringOption(b =>
            b
                .setName("input")
                .setRequired(true)
                .setDescription("type of input")
                .addChoices(
                    { name: "none", value: "none" },
                    { name: "queue", value: "queue" },
                    { name: "song", value: "song" }
                )
        ),
    
    /**
     * 
     * @param interaction 
     * @param music 
     * @param client 
     * @returns 
     */
    exe: async (interaction: ChatInputCommandInteraction, music: Music, client: Client) => {
        const guild = interaction.guildId;
        const type_option = interaction.options.getString("input", true)
        if (!music.data.has(guild as string)) {
            interaction.reply({
                content: "Bot not in voice"
            })
        } else {
            const queue = music.data.get(guild as string)!;
            switch (type_option) {
                case "none":
                    queue.loop = LoopType.None
                    break;
                case "queue":
                    queue.loop = LoopType.Queue
                    break;
                case "song":
                    queue.loop = LoopType.Song
                    break
                default:
                    interaction.reply("invalid input")
                    return
            }

            interaction.reply({
                content: "Set Loop music success"
            })
        }

    }
}