import React, { useEffect } from 'react'
import styled, { css } from 'styled-components'
import Draggable from 'react-draggable'
import TitleBar from './title-bar'
import Toolbar from './tool-bar'
import isMobile from '@src/is-mobile'
import { useStore } from '@src/context'
import { observer} from 'mobx-react-lite'
import Computer from '@applications/computer'
import Virus from '@applications/virus'
import Notepad from '@applications/notepad'
import Image from '@applications/image'
import IFrame from '@applications/iframe'
import Yahoo from '@applications/yahoo'
import Minesweeper from '@applications/minesweeper'
import { APP_TYPES } from '@src/consts'
import "xp.css/dist/XP.css"
import "./draggable.css"
import Explorer from '../applications/explorer'

const ApplicationContainer = styled.div`
    display: ${props => props.minimized === true ? 'none' : 'flex'};
    z-index: 7;
    flex-direction: column;
    height:${props => props.maximized ? "96.2%" : "70%"};
    width: ${props => props.maximized ? "100%" : "80%"};
    ${props => props.defaultSize === true && css`
        width: ${props.width}px;
        height: ${props.height}px;
        .title-bar-controls button:nth-child(2) {
            opacity: 0.5;
            user-select: none;
        }
    `}
    .window {
        padding: 0;
        box-shadow: none;
        border: none;
        display: flex;
        flex-direction: column;
        height: 100%;
        .title-bar {
            font-family: Noto;
            padding: 0;
            padding-right: 10px;
            height: 35px;
            &:hover {
                cursor: pointer;
            }
            .title-bar-text {
                display: flex;
                flex-direction: row;
                align-items: center;
                
            }
        }
        .window-body {
            border: 3px solid #003bda;
            border-top: none;
            margin: 0;
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
        }
    }
`

const Application = observer((props) => {    
    const { width, height } = props
    const defaultSize = width !== undefined && height !== undefined
    const { ApplicationStore } = useStore()
    useEffect(() => {
        ApplicationStore.setTopElement(props.id)
    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    const renderApplication = () => {
        switch (props.type) {
            case APP_TYPES.WIDGET:
                return <IFrame id={props.id} src={props.link} />
            case APP_TYPES.IMAGE:
                return <Image {...props} />
            case APP_TYPES.NOTEPAD:
                return <Notepad />
            case APP_TYPES.VIRUS:
                return <Virus />
            case APP_TYPES.COMPUTER:
                return <Computer />
            case APP_TYPES.YAHOO:
                return <Yahoo />
            case APP_TYPES.MINESWEEPER:
                return <Minesweeper />
            case APP_TYPES.EXPLORER:
                return <Explorer />
            default:
                return null
            }
    }
    return ( 
        <Draggable 
            disabled={(props.resized && !defaultSize) || isMobile()}
            position={props.position}>
            <ApplicationContainer
                onClick={() => ApplicationStore.setTopElement(props.id)}
                width={width}
                height={height}
                defaultSize={defaultSize}
                className={props.id}
                minimized={props.minimized} 
                maximized={props.resized}>
                <div className="window"> 
                    <TitleBar {...props} />
                    <div className="window-body">
                        {props.bars && <Toolbar bars={props.bars} />}
                        {renderApplication()}
                    </div>
                </div>
            </ApplicationContainer>
        </Draggable>
    )
})

export default Application