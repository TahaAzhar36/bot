import { Listener } from "@sapphire/framework"
import {
  DiscordAPIError,
  type GatewayMessageReactionAddDispatchData,
  PermissionFlagsBits,
} from "discord.js"
import { getEmojiKey } from "../../lib/emojis/getEmojiKey"
import { getSelf } from "../../lib/guilds/getSelf"
import { getCacheEntry } from "../../lib/storage/getCacheEntry"
import type { ReactionRoleData } from "../../lib/types/ReactionRoleData"

export class ReactionRoleRemoveListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      name: "reaction-role-remove",
      emitter: "ws",
      event: "MESSAGE_REACTION_REMOVE",
    })
  }

  override async run(payload: GatewayMessageReactionAddDispatchData) {
    if (!payload.guild_id) return

    const guild = this.container.client.guilds.cache.get(payload.guild_id!)!
    const self = await getSelf(guild)
    if (!self.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return
    }

    const cacheKey = `reaction-role:${payload.message_id}:${getEmojiKey(
      payload.emoji,
    )}`
    const roleId = await getCacheEntry(cacheKey, async () => {
      return await this.container
        .database<ReactionRoleData>("reaction_roles")
        .where({ message_id: payload.message_id })
        .where({ reaction: getEmojiKey(payload.emoji) })
        .first()
        .then((reactionRole) => reactionRole?.role_id ?? "")
    })
    if (!roleId) return

    const role = guild.roles.cache.get(roleId)
    try {
      if (!role || !role.editable) return
    } catch {
      return
    }

    try {
      const member = await guild.members.fetch(payload.user_id)
      await member.roles.remove(role)
    } catch (error: unknown) {
      if (error instanceof DiscordAPIError && error.code === 10007) {
        return
      } else {
        throw error
      }
    }
  }
}
