import { Events, Message } from "discord.js";
import { EventStructure } from "../../common/structure/event.structure"; 
import { ReactionsService } from "./services/reaction.service";

export default class MessageCreate extends EventStructure {
  name: string = Events.MessageCreate
  once: boolean = false

  async execute(message: Message) {
    if (!message.content.startsWith(process.env.PREFIX || ".")) {
      return
    }
    const reactionService = new ReactionsService()
    await reactionService.main(message)
    
  }
}