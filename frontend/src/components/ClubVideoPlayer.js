import React from 'react'
import { makeStyles } from '@material-ui/core'
import PropTypes from 'prop-types'

const useStyles = makeStyles(() => ({
  video: {
    width: '100%',
    backgroundColor: 'grey',
  },
}))

function ClubVideoPlayer({id, mediaStream, muted }) {
  const videoRef = React.createRef()
  const classes = useStyles()
  let node = document.querySelector(`#${id}`)
  console.log(id)
  console.log(node)

  return (
    <video id={id} srcObject={mediaStream} className={classes.video} autoPlay muted={muted} ref={videoRef}>
      <track default />
    </video>
  )
}

ClubVideoPlayer.defaultProps = {
  muted: false,
}

ClubVideoPlayer.propTypes = {
  mediaStream: PropTypes.objectOf(PropTypes.object).isRequired,
  muted: PropTypes.bool,
}

export default ClubVideoPlayer
