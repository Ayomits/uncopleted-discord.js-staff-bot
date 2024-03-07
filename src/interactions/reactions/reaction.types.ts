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
  aliases: string[]; // string[] это массив строк
  cost: number;
};

// То как выглядит сам конфиг
export type ConfigData = { [key: string]: ConfigStruct };

export type ChoicesData = { name: string; value: string };

// string[] это массив строк
export type ReactionsUrl = { [key: string]: string[] };
