import { Listener } from "@sapphire/framework"
import { GatewayOpcodes, type GatewayReceivePayload } from "discord.js"

export class RawGatewayPayloadListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      name: "raw-gateway-payload",
      event: "raw",
    })
  }

  override async run(payload: GatewayReceivePayload, shard: number) {
    if (payload.op !== GatewayOpcodes.Dispatch) return

    this.container.metrics.gatewayDispatchEvents.inc({
      event: payload.t,
      shard,
    })
  }
}
