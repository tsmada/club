import React, { Component } from 'react';
import ClubVideo from './ClubMember.jsx';
import Peering from './functions/peering.js';
import SignalingServer from './functions/signaling.js';

class ClubGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localMediaStream: false,
      remoteMediaStream: false,
      peers: {},
      mutedStreams: [],
      senders: [],
    };
    this.socket = new SignalingServer();
  }

  stopMediaStream = (stream) => {
  	if (!stream) {
      return
    }

  	let tracks = stream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
      tracks[i].stop()
    }

    this.setState({
        localMediaStream: null,
      })
    return stream
  }

  createMediaStream = async () => {
    const constraints = { video: true, audio: true };
    let mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    if (mediaStream) {
      this.setState({
        localMediaStream: mediaStream
      })
    }
    let local = document.querySelector('#local')
    local.srcObject = mediaStream;
    local.srcObject.onremovetrack = this.onRemoveMedia();

    this.handleConnection()
  }

  handleMediaStream = async () => {
    if (this.state.localMediaStream) {
      this.stopMediaStream(this.state.localMediaStream)
    } else {
      this.createMediaStream()
    }
  }

  onRemoveMedia = async (event) => {
  	// Broadcast removed media to peers
  }

  onMute = (stream) => {
    console.log('Muting...', stream)
    let streams = this.state.mutedStreams
    streams.push(stream)
    this.setState({
      mutedStreams: streams,
      muted: true,
    })
  }

  onNegotiationNeeded = async (event, peer) => {

  }

  handleConnection = async () => {
    let signals = this.socket
    let peers = new Peering("videos", this.state.localMediaStream, signals, this.state.peers, this.state.senders)

    signals.addEventListener("connected", async (event) => {
        await peers.onConnected()
        await signals.onConnected()
        signals.sendJoin()
      })

    signals.addEventListener('negotiationneeded', async (event) => {
    	console.log('negotiation needed')
    })

    signals.addEventListener("join", async (event) => {
      let offer = await peers.onJoin(event.detail)
      signals.sendOffer(event.detail.peerId, offer)
    })

    signals.addEventListener("leave", async (event) => {
      await peers.onLeave(event.detail)
    })

    signals.addEventListener("offer", async (event) => {
      let answer = await peers.onOffer(event.detail)
      signals.sendAnswer(event.detail.peerId, answer)
    })

    signals.addEventListener("icecandidate", async (event) => {
      peers.onICECandidate(event.detail)
    })

    signals.addEventListener("answer", async (event) => {
      await peers.onAnswer(event.detail)
    })

    signals.addEventListener("disconnected", async (event) => {
      await this.socket.onDisconnected()
      await peers.onDisconnected()
    })

    signals.connect(this.props.URL)
    this.setState({
      peers
    })
    window.addEventListener("unload", function () {
      signals.sendLeave()
    });
  }


  render() {
    const { localMediaStream, remoteMediaStream } = this.state;
    return (
      <>
        {localMediaStream &&
          <>
          <ClubVideo id="local" mediaStream={localMediaStream} muted={false} onMute={this.onMute}/>
          <div>You are now {this.state.muted ? 'muted':'unmuted'}</div>
          </>
        }
        {
          remoteMediaStream ?
            (<>
              <ClubVideo id="remote" mediaStream={remoteMediaStream} muted={false} />
              <div id="videos">
              </div>
            </>) : <div id="videos"><video id="local" autoPlay muted></video></div>
        }
        <button id="start" onClick={this.handleMediaStream}>{!localMediaStream ? 'Start Camera' : 'Stop Camera'}</button>
      </>
    );
  }
}
export default ClubGroup;
