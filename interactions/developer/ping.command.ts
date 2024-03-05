import {
  SlashCommandBuilder,
  CommandInteraction,
} from "discord.js";
import { SlashCommandStructure } from "../../common/structure/command.structure";
import { PingService } from "./services/ping.service";

// Implements - реализовать
// extends от implements отличается тем, что первый расширяет возможности, а второй заставляет переписать возможности не допуская расширения

export class Ping implements SlashCommandStructure {
  data: SlashCommandBuilder;

  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Пинг бота");
  }

  async execute(interaction: CommandInteraction) {
    const pingService = new PingService(interaction); // инициализируем наш сервис

    return pingService.generateEmbed(); // возвращаем метод из сервиса
  }
}
