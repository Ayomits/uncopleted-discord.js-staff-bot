import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommandStructure } from "../../common/structure/command.structure";
import { VacansiesSettingsService } from "./services/settings.service";

export class VacansiesSettingsCommand implements SlashCommandStructure {
  
  data: SlashCommandBuilder;

  constructor (
    private readonly settingsService: VacansiesSettingsService = new VacansiesSettingsService()
  ) {
    this.data = new SlashCommandBuilder()
                .setName(`vacansies-settings`)
                .setDescription(`setup your vacansies`)
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  }
  
  async autoComplete(interaction: any) {
    throw new Error(`Methond not implemented`)
  }

  async execute(interaction: CommandInteraction) {
    return this.settingsService.main(interaction)
  }
  
}