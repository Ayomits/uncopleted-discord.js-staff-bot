import {
  ActionRowBuilder,
  EmbedBuilder,
  Interaction,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../../../../database/index";
import { EmbedType } from "../../settings.types";

// Nothing DTO
// It's painful for me ((((
// I really like all in nestjs architecture and phylocophy )

export class VacansiesCrud {
  async create(interaction: StringSelectMenuInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("vacancy-create")
      .setTitle("Создание вакансии");

    const vacancyName = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Название вакансии")
        .setPlaceholder("модерация...")
        .setMaxLength(50)
        .setMinLength(1)
        .setStyle(TextInputStyle.Short)
    );
    const vacancyIcon = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("icon")
        .setLabel("Иконка вакансии")
        .setPlaceholder("вставьте сюда эмодзи сервера")
        .setStyle(TextInputStyle.Short)
    );
    const vacancyDescription = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Описание вакансии")
        .setPlaceholder(`набор на пост {post}`)
        .setMaxLength(100)
        .setMinLength(1)
        .setStyle(TextInputStyle.Paragraph)
    );

    modal.addComponents(vacancyName, vacancyDescription, vacancyIcon as any);
    await interaction.showModal(modal);

    interaction.client?.on(
      "interactionCreate",
      async (interaction: Interaction): Promise<any> => {
        try {
          if (interaction.isModalSubmit()) {
            if (interaction.customId === "vacancy-create") {
              const name = interaction.fields.getField("name").value;
              const description =
                interaction.fields.getField("description").value;
              const icon = interaction.fields.getField("icon").value;
              const existedVacancy = await prisma.vacancy.findFirst({
                where: { name: name, guildId: interaction.guildId as string },
              });
              if (existedVacancy) {
                return await interaction.reply({
                  content:
                    "Вакансия с таким названием уже существует, укажите другое название",
                  ephemeral: true,
                });
              }
              try {
                await prisma.vacancy.create({
                  data: {
                    name: name,
                    guildId: interaction?.guildId as string,
                    description: description,
                    icon: icon,
                  },
                });
              } catch (err) {
                return await interaction.reply({
                  content: "Что-то пошло не так... \n" + err,
                  ephemeral: true,
                });
              }
            }
            return await interaction.reply({
              content: "Вакансия успешно создана",
              ephemeral: true,
            });
          }
        } catch (err) {}
      }
    );
  }
  async findAll(interaction: StringSelectMenuInteraction) {
    let vacancies;
    try {
      vacancies = await prisma.vacancy.findMany({
        where: { guildId: interaction.guildId as string },
      });
    } catch (err) {
      return interaction.reply({
        content: "Что-то пошло не так...\n" + err,
      });
    }

    if (vacancies.length < 1) {
      return interaction.reply({
        content: `В данный момент на сервере нет вакансий... Создайте их с помощью кнопки "создавать вакансию"`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder().setTitle(
      "Существующие вакансии (P.s. здесь нет вопросов и эмбеда к ним)"
    );

    let description: string = `Список вакансий:\n`;
    let counter: number = 1;

    vacancies.forEach(async (vacancy) => {
      description += `**${counter}.** ${vacancy.icon} ***${vacancy.name}*** - ${vacancy.description}\n`;
      counter += 1;
    });

    return interaction.reply({
      embeds: [
        embed
          .setDescription(description)
          .setColor(
            process.env.BASE_EMBED_COLOR
              ? parseInt(process.env.BASE_EMBED_COLOR, 16)
              : null
          ),
      ],
      ephemeral: true,
    });
  }
  async findByName(interaction: StringSelectMenuInteraction) {
    const modal = new ModalBuilder()
      .setTitle("Поиск по названию")
      .setCustomId("findByName");

    const name = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Название")
        .setPlaceholder("name")
        .setStyle(TextInputStyle.Short)
    );

    modal.addComponents(name as any);

    await interaction.showModal(modal);

    interaction.client.on(
      "interactionCreate",
      async (interaction: Interaction): Promise<any> => {
        try {
          if (
            interaction.isModalSubmit() &&
            interaction.customId === "findByName"
          ) {
            const name = interaction.fields.getField("name").value;
            const vacancy = await prisma.vacancy.findFirst({
              where: { guildId: interaction.guildId as string, name: name },
            });
            if (!vacancy) {
              return interaction.reply({
                content: "Такой вакансии не существует",
                ephemeral: true,
              });
            }
            return interaction.reply({
              content: `${vacancy.id}. ${vacancy.icon} - ${vacancy.name} - ${vacancy.description}`,
              embeds: [vacancy.embed as any],
              ephemeral: true,
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    );
  }
  async update(interaction: StringSelectMenuInteraction) {}
  async delete(interaction: StringSelectMenuInteraction) {}
  public async embedSettings(interaction: StringSelectMenuInteraction) {
    const modal = new ModalBuilder()
      .setTitle("Embed Generator")
      .setCustomId("vacansy-embed");

    const name = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Название вакансии")
        .setPlaceholder("name")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
    );

    const jsonEmbed = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("embed")
        .setLabel("Заголовок")
        .setPlaceholder("{title: title}")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
    );

    modal.addComponents(name, jsonEmbed as any);

    await interaction.showModal(modal);

    interaction.client.on(
      "interactionCreate",
      async (interaction: Interaction): Promise<any> => {
        try {
          if (
            interaction.isModalSubmit() &&
            interaction.customId === "vacancy-embed"
          ) {
            const name = interaction.fields.getField("name").value;
            const existedVacancy = await prisma.vacancy.findFirst({
              where: { guildId: interaction.guildId as string, name: name },
            });
            if (!existedVacancy) {
              return interaction.reply({
                content: "Такой вакансии не существует",
                ephemeral: true,
              });
            }
            const jsonEmbed = JSON.parse(
              interaction.fields.getField("jsonEmbed").value
            );
            let embedData: EmbedType;
            try {
              const embed = jsonEmbed.embeds[0] as EmbedType;
              embedData = {
                title: embed.title,
                description: embed.description,
                color: embed.color,
                image: { url: embed.image.url },
              };
            } catch (err) {
              return interaction.reply({
                content: "Невалидный JSON вебхука",
                ephemeral: true,
              });
            }
            await prisma.vacancy.update({
              where: { name: name, guildId: interaction.guildId as string },
              data: { embed: embedData },
            });
            return interaction.reply({
              content: "Операция успешна",
              ephemeral: true,
            });
          }
        } catch (err) {}
      }
    );
  }
}
