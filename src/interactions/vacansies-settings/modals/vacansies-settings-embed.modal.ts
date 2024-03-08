import { Embed, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { ComponentStructure } from "../../../common/structure/component.structure";
import { prisma } from "../../../database";

export class VacansiesModal extends ComponentStructure {
  customId: string = "vacansies-settings-embed";

  async execute(interaction: ModalSubmitInteraction) {
    const stringJsonByDiscohook = interaction.fields.getField("embedJson")
      .value as string;
    let jsonEmbed;
    try {
      jsonEmbed = JSON.parse(stringJsonByDiscohook).embeds[0];
    } catch (err) {
      return await interaction.reply({
        content: String(err),
        ephemeral: true,
      });
    }
    try {
      const existedSettings = await prisma.vacansiesSettings.findUnique({
        where: { guildId: interaction.guildId as string },
      });
      if (existedSettings) {
        await prisma.vacansiesSettings.update({
          where: { guildId: interaction.guildId as string },
          data: {
            embed: jsonEmbed,
          },
        });
      } else {
        await prisma.vacansiesSettings.create({
          data: {
            guildId: interaction.guildId as string,
            embed: jsonEmbed,
          },
        });
      }
      return await interaction.reply({
        content: "Операция завершена успешно",
        embeds: [jsonEmbed],
        ephemeral: true,
      });
    } catch (err) {
      return await interaction.reply({
        content: String(err),
        ephemeral: true,
      });
    }
  }
}
