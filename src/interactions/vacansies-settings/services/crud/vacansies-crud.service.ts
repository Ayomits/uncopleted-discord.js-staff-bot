import {
  ActionRowBuilder,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  TextInputBuilder,
} from "discord.js";
import { prisma } from "../../../../database/index";

// Nothing DTO
// It's painful for me ((((
// I really like all in nestjs architecture and phylocophy )

export class VacansiesCrud {
  async create(interaction: StringSelectMenuInteraction) {
    console.log("отработало");
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
    );
    const vacancyIcon = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("icon")
        .setLabel("Иконка вакансии")
        .setPlaceholder("вставьте сюда эмодзи сервера")
    );
    const vacancyDescription = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Описание вакансии")
        .setPlaceholder(`набор на пост {post}`)
        .setMaxLength(100)
        .setMinLength(1)
    );

    modal.addComponents(vacancyName, vacancyDescription, vacancyIcon as any);
    await interaction.showModal(modal);

    interaction.client?.on(
      "interactionCreate",
      async (interaction: Interaction): Promise<any> => {
        if (interaction.isModalSubmit()) {
          if (interaction.customId === "vacancy-create") {
            const name = interaction.fields.getField("name").value;
            const description =
              interaction.fields.getField("description").value;
            const icon = interaction.fields.getField("icon").value;
            const existedVacancy = await prisma.vacancy.findUnique({
              where: { name: name },
            });
            if (existedVacancy) {
              return await interaction.reply({
                content:
                  "Вакансия с таким названием уже существует, укажите другое название",
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
      }
    );
  }
  async findAll(interaction: StringSelectMenuInteraction) {}
  async findByName(interaction: StringSelectMenuInteraction) {}
  async update(interaction: StringSelectMenuInteraction) {}
  async delete(interaction: StringSelectMenuInteraction) {}
  async embed(interaction: StringSelectMenuInteraction) {}
}
