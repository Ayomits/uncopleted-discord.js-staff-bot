import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { SlashCommandStructure } from "../../common/structure/command.structure";

// Command for creating Settings

export class VacansiesSettingsCommand implements SlashCommandStructure {
  data: SlashCommandBuilder;

  constructor() {
    this.data = new SlashCommandBuilder()
      .setName(`vacansies-settings`)
      .setDescription(`setup your vacansies`)
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle(`Настройки модуля ${interaction.guild?.name}`)
      .setColor(
        process.env.BASE_EMBED_COLOR
          ? parseInt(process.env.BASE_EMBED_COLOR, 16)
          : null
      )
      .setDescription(
        `Здесь вы сможете настроить вакансии для сервера ${interaction.guild?.name}`
      );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("vacansies-settings-menu")
      .setPlaceholder("выберите настройку")
      .setOptions(
        {
          label: "Канал публикации",
          value: "publishChannelId",
        },
        {
          label: "Канал публикации заявок",
          value: "vacansiesPublishChannelId",
        },
        {
          label: "Вакансии",
          value: "vacansies",
        },
        {
          label: "Эмбед",
          value: "embed",
        }
      );
    const raw = new ActionRowBuilder().addComponents(selectMenu);
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [raw as any],
    });
  }
}
