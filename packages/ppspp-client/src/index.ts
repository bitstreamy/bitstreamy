import { AckMessage, ProtocolOptions } from "@verygood.stream/ppspp-protocol";
import { Duplex } from "stream";
import { RemotePeer } from "./RemotePeer";
import { SwarmMetadata } from "./SwarmMetadata";
import { SwarmTrackers } from "./SwarmTrackers";

export class Client extends Duplex {
  private static PROTOCOL_VERSION = 1;
  private static SUPPORTED_MESSAGES = [AckMessage.CODE];

  private trackers: SwarmTrackers;
  private peers: RemotePeer[];
  private protocolOptions: ProtocolOptions;
  private chunkStore: Buffer[];

  constructor(swarmMetadata: SwarmMetadata, trackerUrls: string[]) {
    super();

    const {
      swarmId,
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod,
      merkleHashFunction,
      liveSignatureAlgorithm
    } = swarmMetadata;

    this.protocolOptions = new ProtocolOptions(
      Client.PROTOCOL_VERSION,
      contentIntegrityProtectionMethod,
      chunkAddressingMethod,
      1,
      chunkSize,
      Client.SUPPORTED_MESSAGES,
      Client.PROTOCOL_VERSION,
      liveSignatureAlgorithm,
      merkleHashFunction,
      swarmId,
    );

    this.chunkStore = [];

    this.trackers = new SwarmTrackers(trackerUrls);

    this.trackers.on("peers", this.handleTrackerPeers.bind(this));

    this.peers = [];
  }

  public start() {
    this.trackers.register();
  }

  private handleTrackerPeers(offers: string[]) {
    offers.forEach(offer =>
      this.peers.push(
        new RemotePeer(offer, this.protocolOptions, this.chunkStore)
      )
    );
  }
}
