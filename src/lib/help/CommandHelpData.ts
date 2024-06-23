import type { Snowflake } from "discord.js"

export type ArgumentHelpData = {
  name: string
  description: string
  required: boolean
}

export type SubcommandHelpData = {
  name: string
  description: string
  arguments: ArgumentHelpData[]
}

export type CommandHelpData = {
  id: Snowflake
  displayName: string
  description: string
  arguments: ArgumentHelpData[]
  subcommands: SubcommandHelpData[]
}
