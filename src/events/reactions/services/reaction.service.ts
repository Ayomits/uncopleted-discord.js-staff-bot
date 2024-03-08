import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Message,
  User,
  ButtonStyle,
  ButtonInteraction,
} from "discord.js";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";

export class ReactionsService {
  public async main(message: Message): Promise<any> {
    const reaction = message.content
      .toLowerCase()
      .replace(process.env.PREFIX || ".", "")
      .split(" ")[0];
    const config = await this.readConfig("reactions.json");
    const reactionKey = await this.getReactionKey(reaction, config);
    if (!reactionKey) {
      return;
    }
    const reactionStruct = await this.getReactionStruct(reactionKey, config);
    const reactionUrl = await this.getReactionUrl(reactionKey, config);
    const targetUser = message.mentions.users.first();
    const authorId = message.author.id;
    const embed = new EmbedBuilder()
      .setTitle(`Реакция: ${reactionStruct?.action?.toLowerCase()}`)
      .setColor(
        process.env.BASE_EMBED_COLOR
          ? parseInt(process.env.BASE_EMBED_COLOR, 16)
          : null
      )
      .setFooter({
        iconURL: message.author
          ? message.author?.displayAvatarURL()
          : undefined,
        text: message.author?.username,
      })
      .setTimestamp(new Date())
    let description: string = "";
    if (!reactionStruct?.everyone) {
      if (targetUser) {
        const isAuthor = await this.isAuthor(targetUser.id, message.author.id);
        const isBot = await this.isBot(targetUser);
        isBot
          ? (description +=
              "Я тоже считаю, что боты живые, но укажи корректного пользователя!")
          : isAuthor
            ? (description +=
                "Тебе так одиноко? Укажи другого пользователя, а не себя!")
            : false;

        if (!isAuthor && !isBot) {
          if (reactionStruct?.isAcceptable) {
            return await this.acceptableReactionDescription(
              message,
              targetUser.id,
              authorId,
              reactionStruct,
              embed,
              reactionUrl
            );
          } else {
            // if reaction didn't require to accept
            description += await this.generatePingDescription(
              targetUser.id,
              authorId,
              reactionStruct
            );
            return await message.reply({
              embeds: [embed.setDescription(description).setImage(reactionUrl)],
            });
          }
        } else {
          // if bot or author
          return await message.reply({
            embeds: [embed.setDescription(description)],
          });
        }
      } else {
        // if not pinged user
        return await message.reply({
          embeds: [embed.setDescription("Укажите пользователя!")],
        });
      }
    } else {
      if (targetUser) {
        const isAuthor = await this.isAuthor(targetUser.id, message.author.id);
        const isBot = await this.isBot(targetUser);
        isBot
          ? (description +=
              "Я тоже считаю, что боты живые, но укажи корректного пользователя!")
          : isAuthor
            ? (description +=
                "Тебе так одиноко? Укажи другого пользователя, а не себя!")
            : false; // Немного нарушаю принцип KISS : ((( (ну или же Keep It Simple, Stupid!)

        if (!isAuthor && !isBot) {
          description += await this.generatePingDescription(
            targetUser.id,
            authorId,
            reactionStruct
          );
          return await message.reply({
            embeds: [embed.setDescription(description).setImage(reactionUrl)],
          });
        } else {
          return await message.reply({
            embeds: [embed.setDescription(description)],
          });
        }
      } else {
        description += await this.generateNotPingDescription(
          authorId,
          reactionStruct
        );
        return await message.reply({
          embeds: [embed.setDescription(description).setImage(reactionUrl)],
        });
      }
    }
  }

  private async readConfig(configName: string): Promise<any> {
    const configPath = path.resolve(__dirname, "..", "configs", configName);
    const config = JSON.parse(await fs.promises.readFile(configPath, "utf-8"));
    return config;
  }

  private async getReactionKey(
    reaction: string,
    config: ConfigData
  ): Promise<string> {
    const reactionConf = config[reaction];
    if (!reactionConf) {
      for (let key in config) {
        const entry = config[key];
        if (entry.aliases.includes(reaction)) {
          return key;
        }
      }
    }
    return reaction;
  }

  private async getReactionStruct(
    reactionKey: string,
    config: ConfigData
  ): Promise<ConfigStruct> {
    return config[reactionKey];
  }

  private async getReactionUrl(
    reactionKey: string,
    config: ConfigData
  ): Promise<any> {
    if (config[reactionKey]?.isApi) {
      const request = await axios.get(
        process.env.API_URL + `/gif?reaction=${reactionKey}&format=gif`
      );
      return request.data?.url;
    } else {
      const reactionUrls: ReactionsUrl =
        await this.readConfig("reactionslink.json");
      const urls = reactionUrls[reactionKey];
      if (urls && urls.length > 0) {
        const randIndex = Math.floor(Math.random() * urls.length);
        return urls[randIndex];
      }
    }
  }

  private async isBot(targetUser: User): Promise<boolean> {
    return targetUser.bot;
  }

  private async isAuthor(
    targetUserId: string,
    authorId: string
  ): Promise<boolean> {
    return targetUserId === authorId;
  }

  private async generatePingDescription(
    targetUserId: string,
    authorId: string,
    struct: ConfigStruct
  ): Promise<string> {
    return `<@${authorId}> ${struct.verbal} ${struct.memberVerb} <@${targetUserId}>`;
  }

  private async generateNotPingDescription(
    authorId: string,
    struct: ConfigStruct
  ): Promise<string> {
    return `<@${authorId}> ${struct.verbal} ${struct.everyoneVerb}`;
  }

  private async acceptableReactionDescription(
    message: Message,
    targetUserId: string,
    authorId: string,
    struct: ConfigStruct,
    embed: EmbedBuilder,
    reactionlink: string
  ): Promise<any> {
    const requestButtons: any = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`accept_${targetUserId}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✅"),
      new ButtonBuilder()
        .setCustomId(`cancel_${targetUserId}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("❌")
    );
    let isClicked: boolean = false;
    const replyMessage = await message.reply({
      embeds: [
        embed.setDescription(
          `<@${targetUserId}> эй! Тебя тут <@${authorId}> хочет ${struct.action.toLowerCase()}. Что скажешь? И нет-нет, я не завидую`
        ),
      ],
      components: [requestButtons],
    });

    message.channel
      ?.createMessageComponentCollector({
        time: 15_000,
        filter: (interaction) => interaction.user.id === targetUserId,
      })
      .on("collect", async (interaction: ButtonInteraction): Promise<any> => {
        switch (interaction.customId) {
          case `accept_${targetUserId}`:
            isClicked = true;
            return replyMessage.edit({
              embeds: [
                embed
                  .setDescription(
                    await this.generatePingDescription(
                      targetUserId,
                      authorId,
                      struct
                    )
                  )
                  .setImage(reactionlink),
              ],
              components: [],
            });
            break;
          case `cancel_${targetUserId}`:
            isClicked = true;
            return await replyMessage.edit({
              embeds: [
                embed.setDescription(
                  `<@${targetUserId}> отклонил ваше предложение :(`
                ),
              ],
              components: [],
            });
            break;
        }
      })
      .on("end", async (interaction: ButtonInteraction): Promise<any> => {
        try {
          if (!isClicked) {
            console.log(interaction);
            return await replyMessage.edit({
              embeds: [
                embed.setDescription(
                  `<@${targetUserId}> проигнорировал вашу реакцию. Не расстраивайтесь! Всё будет хорошо)`
                ),
              ],
              components: [],
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
  }
}

type ConfigStruct = {
  action: string;
  api_name: string;
  everyone: boolean;
  everyoneVerb: string;
  isApi: boolean;
  memberVerb: string;
  verbal: string;
  type: string;
  isAcceptable: boolean;
  nsfw: boolean;
  aliases: string[]; // string[] это массив строк
  cost: number;
};

type ConfigData = { [key: string]: ConfigStruct };

type ReactionsUrl = { [key: string]: string[] };
