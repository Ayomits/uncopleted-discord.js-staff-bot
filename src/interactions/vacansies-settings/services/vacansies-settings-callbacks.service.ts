import {
  ActionRowBuilder,
  EmbedBuilder,
  Message,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../../../database";

// This service needs for select menu in firs callback
// This functions calling as callback by options

export class VacansiesSelectCallback {
  public async handleChannelSelection(
    interaction: StringSelectMenuInteraction,
    channelFieldName: string
  ) {
    const collector = interaction.channel?.createMessageCollector({
      filter: (message) => message.author.id === interaction.user.id,
      time: 15000,
    });

    await interaction.reply({
      content: "В течение 15 секунд напишите ID канала",
    });

    collector?.on("collect", async (message: Message): Promise<any> => {
      const channelId = message.content.split(" ")[0];
      const channelInGuild = message.guild?.channels.cache.get(channelId);

      if (!channelInGuild) {
        collector.stop();
        return await message.reply({
          content: "Указанный канал не найден",
        });
      }

      try {
        const dataUpdate = { [channelFieldName]: channelId };
        await this.updateOrCreateSettings(
          interaction.guildId as string,
          dataUpdate
        );
        collector.stop();
        return await message.reply({
          content: `Канал успешно установлен как: <#${channelId}>`,
        });
      } catch (error) {
        collector.stop();
        await message.reply({
          content: "Что-то пошло не так\n"+error,
        });
      }
    })
  }

  public async updateOrCreateSettings(
    guildId: string,
    data: Record<string, any>
  ): Promise<void> {
    const existedSettings = await prisma.vacansiesSettings.findUnique({
      where: { guildId },
    });

    if (existedSettings) {
      await prisma.vacansiesSettings.update({ where: { guildId }, data });
    } else {
      await prisma.vacansiesSettings.create({ data: { guildId, ...data } });
    }
  }

  // Channel for publishing Public embed

  async getPublishChannel(interaction: StringSelectMenuInteraction) {
    return await this.handleChannelSelection(interaction, "publishChannelId");
  }

  // Channel for publishing anketa embed

  async getVacanciesPublishChannel(interaction: StringSelectMenuInteraction) {
    return await this.handleChannelSelection(
      interaction,
      "vacansiesPublishChannelId"
    );
  }

  // CREATE/READ/UPDATE/DELETE vacansies shorter CRUD

  public async vacansies(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
      .setTitle("Настройки вакансий")
      .setDescription("Здесь вы можете создать/просмотреть/обновить/удалить вакансию")
      .setColor(process.env.BASE_EMBED_COLOR ? parseInt(process.env.BASE_EMBED_COLOR, 16) : null)

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("vacansies-settings-vacancy")
      .setPlaceholder("Выберите настройку")
      .setOptions(
        { label: "Создать вакансию", value: "create" },
        { label: "Просмотреть все вакансии", value: "findAll" },
        { label: "Просмотреть по имени", value: "findByName" },
        { label: "Обновить вакансию", value: "update" },
        { label: "Удалить вакансию", value: "delete" }
      );

    return interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(selectMenu) as any],
      ephemeral: true,
    });
  }

  public async embed(interaction: StringSelectMenuInteraction) {
    const modal = new ModalBuilder()
      .setTitle("Embed Generator")
      .setCustomId("vacansies-settings-embed");
    const jsonTextInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
      .setCustomId("embedJson")
      .setLabel("JSON")
      .setPlaceholder("Вставьте JSON код")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph)
    )

    modal.addComponents(jsonTextInput as any);

    await interaction.showModal(modal);
  }
}
