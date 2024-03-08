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
  "embed": serviceForCallbacks.embedSettings.bind(serviceForCallbacks).bind(serviceForCallbacks),
};

export const vacansiesCrud: {[key: string]: Function} = {
  "create": vacancyCrudService.create.bind(vacancyCrudService),
  "findAll": vacancyCrudService.findAll.bind(vacancyCrudService),
  "findByName": vacancyCrudService.findByName.bind(vacancyCrudService),
  "update": vacancyCrudService.update.bind(vacancyCrudService),
  "delete": vacancyCrudService.delete.bind(vacancyCrudService),
  "embed": vacancyCrudService.embedSettings.bind(vacancyCrudService)
}
export const questionsCrud: {[key: string]: Function} = {
  "create": questionsCrudService.create.bind(questionsCrudService),
  "findAll": questionsCrudService.findAll.bind(questionsCrudService),
  "findByName": questionsCrudService.findByName.bind(questionsCrudService),
  "update": questionsCrudService.update.bind(questionsCrudService),
  "delete": questionsCrudService.delete.bind(questionsCrudService) 
}