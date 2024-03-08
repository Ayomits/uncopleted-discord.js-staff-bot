import { QuestionCrud } from "../services/crud/questions-crud.service";
import { VacansiesCrud } from "../services/crud/vacansies-crud.service";
import { VacansiesSelectCallback } from "../services/vacansies-settings-callbacks.service"

const serviceForCallbacks = new VacansiesSelectCallback();
const vacancyCrudService = new VacansiesCrud()
const questionsCrudService = new QuestionCrud()

export const callbacksConfig: {[key: string]: Function} = {
  "publishChannelId": serviceForCallbacks.getPublishChannel.bind(serviceForCallbacks),
  "vacansiesPublishChannelId": serviceForCallbacks.getVacanciesPublishChannel.bind(serviceForCallbacks),
  "vacansies": serviceForCallbacks.vacansies.bind(serviceForCallbacks).bind(serviceForCallbacks),
  "embed": serviceForCallbacks.embed.bind(serviceForCallbacks).bind(serviceForCallbacks),
};

export const vacansiesCrud: {[key: string]: Function} = {
  "create": vacancyCrudService.create,
  "findAll": vacancyCrudService.findAll,
  "findByName": vacancyCrudService.findByName,
  "update": vacancyCrudService.update,
  "delete": vacancyCrudService.delete,
}
export const questionsCrud: {[key: string]: Function} = {
  "create": questionsCrudService.create,
  "findAll": questionsCrudService.findAll,
  "findByName": questionsCrudService.findByName,
  "update": questionsCrudService.update,
  "delete": questionsCrudService.delete 
}