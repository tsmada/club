// eslint-disable-next-line no-unused-vars
export default class Peering {
  constructor(elmID, stream, signals) {
    this.videosElm = document.getElementById(elmID)
    this.stream = stream
    this.signals = signals
    this.offer = null
    this.peers = {}
    this.senders = []
  }

  /*
  * Retrieves a RTCRPSender based on an associated
  * MediaStreamTrack. Useful for removing tracks
  * from established connections before streaming again.
   */
  senderFromTrack(track) {
    let sender;
    for (var i = 0; i < this.senders.length; i++) {
      if (this.senders[i].track === null) {
        return this.senders[i]
      }
      if (this.senders[i].track.id === track.id && this.senders[i].track.kind === track.kind) {
        sender = this.senders[i]
      }
    }
    return sender
  }

  async onJoin(join) {
    let peer = this.getPeer(join.peerId)
    this.stream.getTracks().forEach((track) => {
      let sender = peer.addTrack(track, this.stream)
      this.senders.push({peer, sender})
    })

    const offer = await peer.createOffer({
      offerToReceiveVideo: 1,
      offerToReceiveAudio: 1,
    })

    await peer.setLocalDescription(offer)

    return offer
  }

  async onLeave(leave) {
    let peer = this.removePeer(leave.peerId)
    if (!peer) {
      return
    }

    let videosElm = document.getElementById("videos")
    let videoElm = document.getElementById(leave.peerId)
    videosElm.removeChild(videoElm)

    peer.close()
  }

  async onOffer(offer) {
    let peer = this.getPeer(offer.peerId)
    peer.setRemoteDescription(offer.offer)
    this.stream.getTracks().forEach((track) => {
      let sender = peer.addTrack(track, this.stream)
      this.senders.push({peer, sender})
    })

    const answer = await peer.createAnswer()
    peer.setLocalDescription(answer)

    return answer
  }

  async onAnswer(answer) {
    let peer = this.getPeer(answer.peerId)
    await peer.setRemoteDescription(answer.answer)
  }

  async onICECandidate(candidate) {
    let peer = this.getPeer(candidate.peerId)
    peer.addIceCandidate(candidate.candidate)
  }

  onConnectionStateChange (event) {
    console.log('onConnectionStateChange:', event);
    switch(event.target.connectionState) {
      case "new":
        console.log("New Connection coming...");
        break;
      case "connecting":
        console.log("Connecting...");
        break;
      case "connected":
        console.log("Online");
        break;
      case "disconnected":
        console.log("Disconnecting...");
        break;
      case "closed":
        console.log("Offline");
        break;
      case "failed":
        console.log("Error");
        break;
      default:
        console.log("Unknown");
        break;
    }
  }

  async onNegotiationNeded (event) {
    console.log('Negotiation needed: ', event)
    let offer = await event.target.createOffer({
      offerToReceiveVideo: 1,
      offerToReceiveAudio: 1,
    })
    await event.target.setLocalDescription(offer)
  }

  newPeer(peerId) {
    const config = {
      iceServers: [{
        urls: "stun:stun1.l.google.com:19302"
      }]
    }

    let peer = new RTCPeerConnection(config)
    let video = document.createElement("video")
    video.id = peerId
    video.autoplay = true

    this.videosElm.appendChild(video)

    peer.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate) {
        this.signals.sendICECandidate(peerId, candidate)
      }
    })

    peer.addEventListener('connectionstatechange', this.onConnectionStateChange)
    peer.addEventListener('negotiationneeded', this.onNegotiationNeded)

    peer.addEventListener("track", (track) => {
      video.srcObject = track.streams[0]
    })

    return peer
  }

  getPeer(peerId) {
    if (this.peers[peerId] === undefined) {
      this.peers[peerId] = this.newPeer(peerId)
    }

    return this.peers[peerId]
  }

  removePeer(peerId) {
    if (this.peers[peerId] === undefined) {
      return null
    }

    let peer = this.peers[peerId]
    delete this.peers[peerId]

    return peer
  }

  onConnected() { }
  onDisconnected() { }
}

