import { CommandInteraction } from "discord.js";
import { Repository } from "typeorm";
import { VacansiesSettingsEntity } from "../entities/settings.entity";
import { getRepository } from "typeorm";

export class VacansiesSettingsService {
  constructor(private readonly vacansiesSettingsRepository: Repository<VacansiesSettingsEntity> = getRepository(VacansiesSettingsEntity)) {}

  async main(interaction: CommandInteraction) {
    const values = await this.vacansiesSettingsRepository.find()
    return interaction.reply({
      content: values.toString()
    })
  }
}