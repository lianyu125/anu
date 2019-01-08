import { registeredComponents, usingComponents, updateMiniApp, _getApp } from './utils';
import { dispatchEvent } from './eventSystem';

export function registerComponent(type, name) {
    registeredComponents[name] = type;
    let reactInstances = type.reactInstances = [];
    type.wxInstances = {};
    return {
        data: {
            props: {},
            state: {},
            context: {}
        },

        attached() {
            usingComponents[name] = type;
            var uuid = this.dataset.instanceUid || null;
            var pagePath = Object(_getApp()).$$pagePath;
            for (var i = 0; i < reactInstances.length; i++) {
                var reactInstance = reactInstances[i];
                if (reactInstance.$$pagePath === pagePath && reactInstance.instanceUid === uuid) {
                    reactInstance.wx = this;
                    this.reactInstance = reactInstance;
                    updateMiniApp(reactInstance);
                    return reactInstances.splice(i, 1);
                }
            }
        },
        detached() {
            let t = this.reactInstance;
            this.disposed = true;
            if (t) {
                t.wx = null;
                this.reactInstance = null;
            }
            console.log(`detached ${name} 组件`); //eslint-disabled-line
        },
        dispatchEvent
    };
}