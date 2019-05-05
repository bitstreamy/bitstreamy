import { PPSPPClient, SwarmMetadata } from "@verygood.stream/ppspp-client";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod
} from "@verygood.stream/ppspp-protocol";
import { TCPServer } from "./TCPServer";

const swarmMetadata = new SwarmMetadata(
  Buffer.from("abc", "utf8"),
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

const client = new PPSPPClient(
  swarmMetadata,
  { liveDiscardWindow: 100 },
  "ws://localhost:8080"
);

const tcpServer = new TCPServer("localhost", 3333);

tcpServer.on("chunk", client.pushChunk.bind(client));

tcpServer.on("end", client.clearChunkStore.bind(client));
