import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core'
import SpeedDial from '@material-ui/lab/SpeedDial'
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon'
import VolumeOffRounded from '@material-ui/icons/VolumeOffRounded'

const useStyles = makeStyles((theme) => ({
  speedDial: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

const actions = [{ icon: <VolumeOffRounded />, name: 'Mute' }]

function ClubVideoActions(props) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  console.log(props)

  return (
    <SpeedDial
      ariaLabel='Streamer Options'
      className={classes.speedDial}
      icon={<SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={props.onMute}
        />
      ))}
    </SpeedDial>
  )
}

export default ClubVideoActions
