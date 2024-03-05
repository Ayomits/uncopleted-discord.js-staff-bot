import { Entity } from "typeorm";
import { GuildCommonEntity } from "../../../common/entities/common.entity";

@Entity({name: "vacansies_settings"})
export class VacansiesSettingsEntity extends GuildCommonEntity {
  
}

