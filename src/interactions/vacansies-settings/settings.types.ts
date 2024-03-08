export type EmbedType = {
  title: string;
  description: string;
  color: string;
  image: {
    url: string
  };
};

export type VacansiesSettingsType = {
  guildId: string;
  publishChannelId: string;
  vacansiesPublishChannelId: string;
  embed: EmbedType;
};

export type QuestionType = {
  guildId: string
  name: string
  placeholder: string
}

export type VacancyType = {
  guildId: string
  name: string
  description: string
  icon: string
  embed: EmbedType
}