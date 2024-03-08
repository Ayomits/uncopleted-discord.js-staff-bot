import { StringSelectMenuInteraction } from "discord.js";
import { ComponentStructure } from "../../../common/structure/component.structure";
import { callbacksConfig } from "../configs/config";

export class VacansiesSelect extends ComponentStructure {
  customId: string = "vacansies-settings-menu"

  async execute(interaction: StringSelectMenuInteraction) {
    const value = interaction.values[0]
    return await callbacksConfig[value](interaction)
  }
}