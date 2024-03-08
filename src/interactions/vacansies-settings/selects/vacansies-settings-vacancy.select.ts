import { StringSelectMenuInteraction } from "discord.js";
import { ComponentStructure } from "../../../common/structure/component.structure";
import { vacansiesCrud } from "../configs/config";

export class VacansiesSelect extends ComponentStructure {
  customId: string = "vacansies-settings-vacancy"

  async execute(interaction: StringSelectMenuInteraction) {
    const value = interaction.values[0]
    return await vacansiesCrud[value](interaction)
  }
}