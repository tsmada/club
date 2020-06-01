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
    };
    this.socket = new SignalingServer();
  }

  createMediaStream = async () => {
    if (this.state.localMediaStream) {
      let tracks = this.state.localMediaStream.getTracks();
      for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop()
      }
      return this.setState({
        localMediaStream: null,
      })
    } else {
      const constraints = { video: true, audio: true };
      let mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (mediaStream) {
        this.setState({
          localMediaStream: mediaStream
        })
      }
      const local = document.querySelector('#local')
      local.srcObject = mediaStream;

      this.handleConnection()
    }
  }

  handleConnection = async () => {
    let signals = this.socket
    let peers = new Peering("videos", this.state.localMediaStream, signals)

    signals.addEventListener("connected", async (event) => {
        await peers.onConnected()

        signals.sendJoin()
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

      signals.connect("ws://localhost:3001/room")
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
        {localMediaStream && <ClubVideo id="local" mediaStream={localMediaStream} muted={true} />}
        {
          remoteMediaStream ?
            (<>
              <ClubVideo id="remote" mediaStream={remoteMediaStream} muted={false} />
              <div id="videos">
              </div>
            </>) : <div id="videos"><video id="local" autoPlay muted></video></div>
        }
        <button id="start" onClick={this.createMediaStream}>{!localMediaStream ? 'Start Camera' : 'Stop Camera'}</button>
      </>
    );
  }
}
export default ClubGroup;
