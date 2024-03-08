import {
  ActionRowBuilder,
  EmbedBuilder,
  Interaction,
  Message,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../../../database";
import { EmbedType } from "../settings.types";

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
          content: "Что-то пошло не так\n" + error,
        });
      }
    });
  }

  public async updateOrCreateSettings(
    guildId: string,
    data: Record<string, any>
  ): Promise<void> {
    const existedSettings = await prisma.vacansiesSettings.findFirst({
      where: { id: { not: 0 }, guildId: guildId },
    });

    if (existedSettings) {
      await prisma.vacansiesSettings.update({
        where: { id: existedSettings.id },
        data,
      });
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
      .setDescription(
        "Здесь вы можете создать/просмотреть/обновить/удалить вакансию"
      )
      .setColor(
        process.env.BASE_EMBED_COLOR
          ? parseInt(process.env.BASE_EMBED_COLOR, 16)
          : null
      );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("vacansies-settings-vacancy")
      .setPlaceholder("Выберите настройку")
      .setOptions(
        { label: "Создать вакансию", value: "create" },
        { label: "Просмотреть все вакансии", value: "findAll" },
        { label: "Просмотреть по имени", value: "findByName" },
        { label: "Обновить вакансию", value: "update" },
        { label: "Удалить вакансию", value: "delete" },
        { label: "Эмбед", value: "embed" }
      );

    return interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(selectMenu) as any],
      ephemeral: true,
    });
  }

  public async embedSettings(interaction: StringSelectMenuInteraction) {
    const existedEmbed = await prisma.vacansiesSettings.findFirst({
      where: { guildId: interaction.guildId as string },
    });
    const embed = existedEmbed?.embed as EmbedType;
    const modal = new ModalBuilder()
      .setTitle("Embed Generator")
      .setCustomId("vacansies-settings-embed");
    const name = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Название")
        .setPlaceholder("name")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setValue(embed?.title || "название")
    );

    const description = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Описание")
        .setPlaceholder("description")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setValue(embed?.description || "описание")
    );

    const color = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("color")
        .setLabel("Цвет")
        .setPlaceholder("000000")
        .setMaxLength(6)
        .setMinLength(6)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setValue(embed?.color || "000000")
    );

    const image = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("image")
        .setLabel("Ссылка на картинку")
        .setPlaceholder("https://example.com")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setValue(embed?.image.url || "http://example.com")
    );

    modal.addComponents(name, description, color, image as any);

    await interaction.showModal(modal);

    interaction.client.on(
      "interactionCreate",
      async (interaction: Interaction): Promise<any> => {
        try {
          if (
            interaction.isModalSubmit() &&
            interaction.customId === "vacansies-settings-embed"
          ) {
            const name = interaction.fields.getField("name").value;
            const description =
              interaction.fields.getField("description").value;
            const color = interaction.fields.getField("color").value;
            const image = interaction.fields.getField("image").value;
            const embedData = {
              title: name,
              description: description,
              color: color,
              image: image,
            };
            if (existedEmbed) {
              await prisma.vacansiesSettings.update({
                where: { id: existedEmbed.id },
                data: { embed: embedData },
              });
            } else {
              await prisma.vacansiesSettings.create({
                data: {
                  embed: embedData,
                  guildId: interaction.guildId as string,
                },
              });
            }
            return await interaction.reply({
              content: "Эмбед успешно установлен",
              ephemeral: true,
            });
          }
        } catch (err) {}
      }
    );
  }
}
