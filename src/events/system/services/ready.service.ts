import { Client, REST, Routes } from "discord.js";
import InteractionCollector from "../collectors/interaction.collector";
import { prisma } from "../../../database";


export default class EventReadyService {
  constructor(
    private readonly client: Client,
    private readonly interactionCollector: InteractionCollector = new InteractionCollector(
      client
    )
  ) {}

  public async commandActions() {
    await this.collectInteractions();
    await this.commandRegister(this.client);
  }

  public async collectAllInvites() {
    const guilds = this.client.guilds.cache;
    guilds.forEach(async (guild) => {
      const invites = await guild.invites.fetch();
      invites.forEach((invite) => {
        invite.client.invites?.set(invite.code, invite.uses);
      });
    });
  }

  public async connectToDb() {
    prisma
      .$connect()
      .then(() => {
        console.log(`[ConnectToDb] успешное подключение к БД`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Регистрация Слэш команд
  private async commandRegister(client: Client) {
    try {
      console.log(`[COMMANDREGISTER] начинаю регистрировать команды...`);

      const rest = new REST().setToken(
        process.env.TOKEN ||
          "MTEyNjk2ODYxMTkxNTk3Njg5NA.GMstbh.pT0jxxoacZaZmCwd3Mf-glqzT-sE_YsKFcPvF0" // старый токен если что, он не рабочий
      );
      const commands = client.commands?.map((command) => command.data.toJSON());

      const commandsData: any = await rest.put(
        Routes.applicationCommands(client.user?.id || "1126968611915976894"),
        { body: commands }
      );

      console.log(
        `[COMMANDREGISTER] все команды зарегистрированы. Количество команд: ${commandsData.length}`
      );
    } catch (err) {
      console.log(err);
    }
  }

  // Сбор всех взаимодействий. Слэш команды, селекты, модалки, кнопки
  private async collectInteractions() {
    await this.interactionCollector.collect();
    console.log(
      "[INTERACTIONCOLLECTOR] все взаимодействия успешно собраны и добавлены в свои коллекции"
    );
  }
}
