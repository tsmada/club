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

  async onJoin(join) {

    let peer = this.getPeer(join.peerId)


    this.stream.getTracks().forEach((track) => {
      try {
        let sender1 = peer.addTrack(track, this.stream)
        this.senders.push(sender1)
      } catch {
        let videoTrack = this.stream.getVideoTracks()[0];
        console.log(this.peers)
        let sender = peer.getSenders().find(function(s) {
        return s.track.id === track.id;
      });
      console.log('found sender:', sender);
      sender.replaceTrack(track);
      }
      
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
      try{
        let sender = peer.addTrack(track, this.stream)
        this.senders.push(sender)
      } catch {
        let sender = peer.getSenders()
        console.log('found sender:', sender);
        // remove all tracks here
      for (var i = 0; i < sender.length; i++) {
      peer.removeTrack(sender[i])
      }
      }
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
    // Remove all tracks from senders from peerconnection registry
    console.log(peer)
    let sender = peer.getSenders()
    console.log('found sender:', sender);
    // remove all tracks here
    for (var i = 0; i < sender.length; i++) {
      peer.removeTrack(sender[i])
    }
    delete this.peers[peerId]

    return peer
  }

  onConnected() { }
  onDisconnected() { }
}

