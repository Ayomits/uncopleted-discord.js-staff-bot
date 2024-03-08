import {
  CommandInteraction,
  SlashCommandBuilder,
  AutocompleteInteraction,
} from "discord.js";
import { SlashCommandStructure } from "../../common/structure/command.structure";
import { ReactionsService } from "./services/reactions.service";

export default class Reaction implements SlashCommandStructure {
  public readonly data: any;
  public readonly reactService = new ReactionsService();

  public constructor() {
    this.data = new SlashCommandBuilder()
      .setName("reactions")
      .setDescription("реакция")
      .addStringOption((option) =>
        option
          .setName("reaction")
          .setDescription("reaction")
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addUserOption((option) =>
        option.setName("user").setDescription("user").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("message").setDescription("message").setRequired(false)
      );
  }

  public async autoComplete(
    interaction: AutocompleteInteraction
  ): Promise<any> {
    const choices = await this.reactService.loadAllReactions();
    const focusedValue = interaction.options.getFocused();
    const filtered = choices.filter((choice) =>
      choice.name.includes(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice.name, value: choice.value }))
    );
  }

  public async execute(interaction: CommandInteraction): Promise<any> {
    try {
      return await this.reactService.main(interaction);
    } catch (err) {
      return await interaction.reply({
        content: "Что-то пошло не так... \n" + err,
      });
    }
  }
}

export type ConfigStruct = {
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
  aliases: string[];
  cost: number;
};

export type ConfigData = { [key: string]: ConfigStruct };

export type ChoicesData = { name: string; value: string };

export type ReactionsUrl = { [key: string]: string[] };
