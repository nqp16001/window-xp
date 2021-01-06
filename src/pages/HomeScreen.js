import React, { useEffect } from 'react'
import Wallpaper from '@images/wallpaper.jpg'
import styled from 'styled-components'
import Taskbar from '@components/task-bar'
import DesktopIcon from '@components/desktop-icon'
import Application from '@components/application'
import Error from '@components/error'
import WindowStartupSound from '@sounds/windows-xp-startup.mp3'
import { useStore } from '@src/context'
import { observer} from 'mobx-react-lite'
import { runInAction } from 'mobx'
import { isMobile } from 'react-device-detect'

const warningMessage = "Your access is restricted on a mobile device. You are not allowed to use laptop icons and can only open one application at a time through the menu. Navigate to laptop for full access"
const HomeScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`

const WallpaperContainer = styled.div`
    z-index: 1;
    background-image: url(${Wallpaper});
    background-size: cover;
    width: 100%;
    flex: 1;
`

const HomeScreen = observer(() => {
    const { ApplicationStore } = useStore()
    const { visibleApps, openApps } = ApplicationStore
    
    useEffect(() => {
        (async () => {
            const sound = new Audio(WindowStartupSound)
            await sound.play()

            if(isMobile) {
                runInAction(() => {
                    ApplicationStore.openMessage(warningMessage, 'warning')
                })
            }
        })()
    }, [])



    return (
        <HomeScreenContainer>
            <Error />
            <WallpaperContainer onClick={ApplicationStore.resetUI} />
            {visibleApps.map((application) => (
                <DesktopIcon 
                    key={application.key}
                    onClick={() => ApplicationStore.onClick(application.key)}
                    {...application} />))}
            {openApps.map((application) => (
                <Application
                    id={application.key}
                    minimize={() => ApplicationStore.minimizeApplication(application.key)} 
                    resize={() => ApplicationStore.resize(application.key)}
                    close={() => ApplicationStore.closeApplication(application.key)}
                    {...application}
                />
            ))} 
            <Taskbar openApplications={openApps} />
        </HomeScreenContainer>
      );
})
  

export default HomeScreen;
