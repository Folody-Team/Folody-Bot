import { ChatInputCommandInteraction, Client, SlashCommandBuilder, WebSocketShard } from "discord.js";
import path from "path"
import { Music } from "../function/Music";

export default {
    data: new SlashCommandBuilder()
        .setName(path.basename(__filename).replace(/\.[^/.]+$/, ""))
        .setDescription('Pause music'),
    
    /**
     * 
     * @param interaction 
     * @param music 
     * @param client 
     * @returns 
     */
    exe: async (interaction: ChatInputCommandInteraction, music: Music, client: Client) => {
        const url = interaction.options.getString('input')
        const guild = interaction.guildId;

        if (!music.data.has(guild as string)) {
            interaction.reply({
                content: "Bot not in voice"
            })
        } else {
            const queue = music.data.get(guild as string);
            if(queue?.data.length == 0) {
                return interaction.reply('Queue not found!')
            }
            queue?.voice.player?.pause()
            interaction.reply({
                content: "Pause music success"
            })
        }

    }
}