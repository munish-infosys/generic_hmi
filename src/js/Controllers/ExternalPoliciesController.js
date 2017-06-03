import sdlController from './SDLController';
import bcController from './BCController';

export default class ExternalPoliciesController {
    constructor() {
        this.packClient = null
        this.unpackClient = null
        this.packUrl = null
        this.unpackUrl = null
        this.sysReqParams = {}

    }
    connectPolicyManager(packUrl, unpackUrl) {
        console.log("connect policy manager")
        this.packUrl = packUrl
        this.unpackUrl = unpackUrl
        this.packClient = new WebSocket(packUrl)
        this.unpackClient = new Websocket(unpackUrl)

        this.packClient.onopen = this.onopen.bind(this)
        this.packClient.onclose = this.onclose.bind(this)
        this.packClient.onmessage = this.onPackMessage.bind(this)

        this.unpackClient.onopen = this.onopen.bind(this)
        this.unpackClient.onclose = this.onclose.bind(this)
        this.unpackClient.onmessage = this.onUnpackMessage.bind(this)
    }
    disconnectPolicyManager() {
        if (this.retry) {
            clearInterval(this.retry);
        }
        if (this.packClient) {
            if(this.packClient.readyState === this.packClient.OPEN) {
                this.packClient.onclose = function () {
                    this.packClient.close()
                }
            }
        }
        if (this.unpackClient) {
            if(this.unpackClient.readyState === this.unpackClient.OPEN) {
                this.unpackClient.onclose = function () {
                    this.unpackClient.close()
                }
            }
        }
    }
    onopen (evt) {
        console.log("on open")
        if (this.retry) {
            clearInterval(this.retry)
        }

    }
    onclose (evt) {
        console.log("on close")
        if (!this.retry) {
            this.retry = setInterval(this.connectPolicyManager.bind(this), 4000)
        }
    }
    onPackMessage(evt) {
        console.log("onPackMessage")
        bcController.onSystemRequest(this.sysReqParams.policyUpdateFile, this.sysReqParams.urls)
        this.sysReqParams = {}
    }
    onUnpackMessage(evt) {
        console.log("onUnpackMessage " + evt)
        sdlController.onReceivedPolicyUpdate(evt.data)
    }
    pack(params) {
        console.log("pack")
        console.log(params)
        this.sysReqParams = params
        this.packClient.send(this.sysReqParams.policyUpdateFile);
    }
}