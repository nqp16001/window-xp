import { makeAutoObservable } from 'mobx'
import {
    defaultOpenApplicationProperties,
    defaultPosition,
    defaultApplicationState
} from '../consts'
import isMobile from '@src/is-mobile'
import { pick } from 'lodash'
import consumifyObject from '@utils/consumify-object'
import { APP_TYPES } from '@src/consts'
import ErrorSound from '../assets/sounds/error.mp3'
const errorSound = new Audio(ErrorSound);
const defaultMessage = "You are not authorized to access this content. Please contact admin for more information."
const oneDeviceMessage = "You are not authorized to use more than 1 application at once on a mobile device. Please use a laptop for full access"
const bannedApplications = ['spider']

class ApplicationStore {
    // Desktop
    applications = defaultApplicationState
    topIndex = 7
    menuOpen = false

    // Computer 
    chosenKey = null
    back = null
    next = null

    // Error
    message = null
    type = 'error'

    constructor () {
        makeAutoObservable(this)
    }

    setTopElement = (key, value = this.topIndex + 1) => {
        const labels = document.getElementsByClassName('react-draggable')
        const matchingLabels = Array.prototype.filter.call(
            labels,
            ({ classList }) => Array.prototype.includes.call(classList, key)
        )
        if(matchingLabels.length > 0 && parseInt(matchingLabels[0].style.zIndex) !== parseInt(this.topIndex)) {
            this.topIndex = value
            matchingLabels[0].style.zIndex = value 
            return true
        } else {
            return false
        }
    }

    // Actions 
    goBack = () => {
        this.next = this.chosenKey
        this.chosenKey = this.back
        this.back = null
    }

    goNext = () => {
        this.back = this.chosenKey
        this.chosenKey = this.next
        this.next = null
    }

    openMessage = (message = defaultMessage, type = 'error') => {
        this.message = message
        this.type = type
        errorSound.play()
    }

    closeMessage () {
        this.message = null
    }

    isComputer (key) {
        return this.applications[key].type === APP_TYPES.COMPUTER
    }

    unclickEverything = () => {
        // Unclick everthing
        Object.keys(this.applications).forEach(key => {
            this.applications[key].clicked = false
        })
      }
    
    closeMenu = () => {
        this.menuOpen = false
    }

    resetUI = () => {
        this.unclickEverything()
        this.closeMenu()
    }
    
    onClick = (key) => {
        const oldClicked = this.applications[key].clicked
        this.resetUI()
        // Handle double click
        const newLastClicked = new Date().getTime()
        const oldlastClicked = this.applications[key].lastClicked
        if(newLastClicked - oldlastClicked < 400) {
            this.openApplication(key, true)
        }
        this.applications[key].lastClicked = newLastClicked
        this.applications[key].clicked = !oldClicked
    }
    
    setNextAndBack (key) {
        this.back = this.chosenKey
        this.next = null
        this.chosenKey = key
    }

    handleOpenComputer (key) {
        if(!this.applications['computer'].open) {
            if(this.shouldOpenApplicationOpenMobile(key)) {
                this.applications['computer'].open = true
                this.setNextAndBack(key)
            } else {
                return
            }
        } else {
            // If computer is already open, reset the next and back button
            // and bring the computer to front
            this.setNextAndBack(key)
            this.unminimizeApplication('computer')
        }
            
      
    }

    handleOpenDefault (key) {
        // If application is not open, open it
        // If it is, bring it to front
        if(!this.applications[key].open) {
            if(this.shouldOpenApplicationOpenMobile(key)) {
                this.applications[key].open = true
            }
        } else {
            this.unminimizeApplication(key)
        }
    }

    shouldOpenApplicationOpenMobile (key) {
        if(isMobile()){ 
            if(this.openApps.length > 0) {
                this.openMessage(oneDeviceMessage)
                return false
            } else if (bannedApplications.includes(key)) {
                this.openMessage(`You are not allowed to open ${this.applications[key].desc} application on a mobile device. Please use a laptop for access`)
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    openApplication = (key, reset = false) => {
        if(!reset) {
            this.resetUI()
        }
        const application = this.applications[key]
        switch(application.type) {
            case APP_TYPES.EXTERNAL:
                window.open(application.externalLink)
                break;
            case APP_TYPES.ERROR:
                this.openMessage()
                break;
            default:
                if(this.isComputer(key)) {
                    this.handleOpenComputer(key)
                } else {
                    this.handleOpenDefault(key)
                }
        }
    }

    unminimizeApplication = (key) => {
        this.applications[key].minimized = false
        this.setTopElement(key)
    }

    // Only minimize if application is not at the top
    smartMinimizeApplication = (key) => {
        // If application is already minimized toggle it
        if(this.applications[key].minimized) {
            this.applications[key].minimized = false
            this.setTopElement(key)
        } else if(!this.setTopElement(key)){
            this.applications[key].minimized = true
        }
    }

    minimizeApplication = (key) => {
        this.applications[key].minimized = !this.applications[key].minimized
    }

    closeApplication = (key) => {
        Object.assign(this.applications[key], defaultOpenApplicationProperties)
    }

    resize = (key) => {
        this.applications[key].position = this.applications[key].resized === false ? defaultPosition : null
        this.applications[key].resized  = !this.applications[key].resized
    }

    // Computed
    get mappableApps () {
        return consumifyObject(this.applications)
    }

    get visibleApps () {
        return this.mappableApps.filter(application => application.x && application.y)
    }

    get menuApps () {
        const menuKeys = ['computer','mine','spider','paint','website','notepad','resume','virus']
        const pickedItems = pick(this.applications, menuKeys)
        return consumifyObject(pickedItems)
    }

    get openApps () {
        return this.mappableApps.filter(application => application.open)
    }

    get files () {
        return this.mappableApps.filter(application => application.type === APP_TYPES.COMPUTER)
    }

    get chosenFile () {
        return this.applications[this.chosenKey]
    }

    get unchosenFiles () {
        return this.files.filter(application => application.key !== this.chosenKey)
    }

    get chosenFileChildren () {
        const childrenObject = pick(this.applications, this.chosenFile.children)
        return consumifyObject(childrenObject)

    }
}

const store = new ApplicationStore()
export default store