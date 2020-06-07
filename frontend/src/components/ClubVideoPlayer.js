import React from 'react'
import { makeStyles } from '@material-ui/core'
import VolumeOffRounded from '@material-ui/icons/VolumeOffRounded'
import PropTypes from 'prop-types'

const useStyles = makeStyles(() => ({
  video: {
    width: '100%',
    backgroundColor: 'grey',
  },
}))

function ClubVideoPlayer({id, muted}) {
  const classes = useStyles()

  return (
    <>
    <video id={id} className={classes.video} autoPlay muted={muted}>
      <track default />
    </video>
    {muted ? <VolumeOffRounded /> : null}
    </>
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
