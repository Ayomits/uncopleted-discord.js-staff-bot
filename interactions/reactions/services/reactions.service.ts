import {
  EmbedBuilder,
  User,
  CommandInteraction,
} from "discord.js";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";
import {
  ChoicesData,
  ConfigData,
  ConfigStruct,
  ReactionsUrl,
} from "../reaction.types";

export class ReactionsService {
  public async main(interaction: CommandInteraction): Promise<any> {
    const embed = new EmbedBuilder().setColor(
      process.env.BASE_EMBED_COLOR
        ? parseInt(process.env.BASE_EMBED_COLOR, 16)
        : null
    );
    const reaction = interaction.options.get("reaction")?.value;
    const message = interaction.options.get("message")?.value;
    const config = await this.readConfig("reactions.json");
    const targetUser = interaction.options.getUser("user");
    const authorId = interaction.user.id;
    let description: string = "";
    let isCorrect = false;
    const struct: ConfigStruct = config[String(reaction)];

    if (!struct) {
      description +=
        "Однажды, идя на работу, мой разработчик наткнулся на злую собаку и вашу реакцию съели!";
      return await interaction.reply({
        embeds: [embed.setDescription(description)],
        ephemeral: true,
      });
    }

    if (targetUser) {
      if (targetUser?.id === interaction.user.id) {
        isCorrect = false;
        description += `Тебе так одиноко! Понимаю, но выбери другого участника! \n`;
      } else if (targetUser?.bot) {
        isCorrect = false;
        description +=
          "Я тоже считаю, что боты живые, но может быть ты выберешь человека?";
      } else {
        isCorrect = true;
        description += await this.generateDescription(
          struct,
          authorId,
          targetUser,
          String(message)
        );
      }
    } else {
      isCorrect = true;
      description += await this.generateDescription(
        struct,
        authorId,
        undefined,
        String(message)
      );
    }

    if (isCorrect) {
      const imageUrl = await this.getUrl(struct, String(reaction));
      embed.setImage(imageUrl);
    }

    embed.setDescription(description);

    return await interaction.reply({
      content: targetUser ? `<@${targetUser.id}>` : undefined,
      embeds: [embed],
      ephemeral: !isCorrect,
    });
  }

  public async loadAllReactions(): Promise<ChoicesData[]> {
    const config: ConfigData = await this.readConfig("reactions.json");
    const choices: ChoicesData[] = [];

    for (let reaction in config) {
      const obj = { name: config[reaction].action, value: reaction };
      choices.push(obj);
    }

    choices.sort((a, b) =>
      a.name.localeCompare(b.name, "ru", { sensitivity: "base" })
    );

    return choices;
  }

  private async readConfig(configName: string): Promise<any> {
    const configPath = path.resolve(__dirname, "..", "configs", configName);
    const config = JSON.parse(await fs.promises.readFile(configPath, "utf-8"));
    return config;
  }

  private async getUrl(struct: ConfigStruct, reaction: string): Promise<any> {
    if (struct.isApi) {
      return (
        await axios.get(process.env.API_URL + `/gif?reaction=${reaction}`)
      ).data.url;
    } else {
      const reactionUrls: ReactionsUrl =
        await this.readConfig("reactionslink.json");
      const randIndex = Math.floor(
        Math.random() * reactionUrls[reaction].length
      );
      return reactionUrls[reaction][randIndex];
    }
  }

  private async generateDescription(
    struct: ConfigStruct,
    authorId: string,
    targetUser?: User,
    message?: string
  ): Promise<string> {
    return `Пользователь <@${authorId}> ${struct.verbal} ${
      targetUser
        ? `${struct.memberVerb} <@${targetUser.id}>`
        : `${struct.everyoneVerb}`
    }${message !== "undefined" ? "\nПотому что " + `**${message}**` : ""}`;
  }
}
