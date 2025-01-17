/************* WARNING *************

    ANY CHANGES TO THIS FILE MUST BE
    DUPLICATED IN XDM.ts.

***********************************/
declare module XDM {
    interface IDeferred<T> {
        resolve: (result: T) => void;
        reject: (reason: any) => void;
        promise: IPromise<T>;
    }
    /**
    * Create a new deferred object
    */
    function createDeferred<T>(): IDeferred<T>;
    /**
    * Settings related to the serialization of data across iframe boundaries.
    */
    interface ISerializationSettings {
        /**
        * By default, properties that begin with an underscore are not serialized across
        * the iframe boundary. Set this option to true to serialize such properties.
        */
        includeUnderscoreProperties: boolean;
    }
    /**
     * Catalog of objects exposed for XDM
     */
    class XDMObjectRegistry implements IXDMObjectRegistry {
        private _registeredObjects;
        /**
        * Register an object (instance or factory method) exposed by this frame to callers in a remote frame
        *
        * @param instanceId unique id of the registered object
        * @param instance Either: (1) an object instance, or (2) a function that takes optional context data and returns an object instance.
        */
        register(instanceId: string, instance: Object | {
            (contextData?: any): Object;
        }): void;
        /**
        * Unregister an object (instance or factory method) that was previously registered by this frame
        *
        * @param instanceId unique id of the registered object
        */
        unregister(instanceId: string): void;
        /**
        * Get an instance of an object registered with the given id
        *
        * @param instanceId unique id of the registered object
        * @param contextData Optional context data to pass to a registered object's factory method
        */
        getInstance<T>(instanceId: string, contextData?: Object): T | undefined ;
    }
    /**
    * The registry of global XDM handlers
    */
    var globalObjectRegistry: XDMObjectRegistry;
    /**
     * Represents a channel of communication between frames\document
     * Stays "alive" across multiple funtion\method calls
     */
    class XDMChannel implements IXDMChannel {
        private static _nextChannelId;
        private static MAX_XDM_DEPTH;
        private static WINDOW_TYPES_TO_SKIP_SERIALIZATION;
        private static JQUERY_TYPES_TO_SKIP_SERIALIZATION;
        private _nextMessageId;
        private _deferreds;
        private _postToWindow;
        private _targetOrigin;
        private _handshakeToken;
        private _channelObjectRegistry;
        private _channelId;
        private _nextProxyFunctionId;
        private _proxyFunctions;
        constructor(postToWindow: Window, targetOrigin?: string);
        /**
        * Get the object registry to handle messages from this specific channel.
        * Upon receiving a message, this channel registry will be used first, then
        * the global registry will be used if no handler is found here.
        */
        getObjectRegistry(): IXDMObjectRegistry;
        /**
        * Invoke a method via RPC. Lookup the registered object on the remote end of the channel and invoke the specified method.
        *
        * @param method Name of the method to invoke
        * @param instanceId unique id of the registered object
        * @param params Arguments to the method to invoke
        * @param instanceContextData Optional context data to pass to a registered object's factory method
        * @param serializationSettings Optional serialization settings
        */
        invokeRemoteMethod<T>(methodName: string, instanceId: string, params?: any[], instanceContextData?: Object, serializationSettings?: ISerializationSettings): IPromise<T>;
        /**
        * Get a proxied object that represents the object registered with the given instance id on the remote side of this channel.
        *
        * @param instanceId unique id of the registered object
        * @param contextData Optional context data to pass to a registered object's factory method
        */
        getRemoteObjectProxy<T>(instanceId: string, contextData?: Object): IPromise<T>;
        private invokeMethod;
        private getRegisteredObject;
        /**
        * Handle a received message on this channel. Dispatch to the appropriate object found via object registry
        *
        * @param data Message data
        * @param origin Origin of the frame that sent the message
        * @return True if the message was handled by this channel. Otherwise false.
        */
        onMessage(data: any, origin: string): boolean;
        owns(source: Window, origin: string, data: any): boolean;
        error(data: any, errorObj: any): void;
        private _error;
        private _success;
        private _sendRpcMessage;
        private _shouldSkipSerialization;
        private _customSerializeObject;
        private _registerProxyFunction;
        private _customDeserializeObject;
    }
    /**
    * Registry of XDM channels kept per target frame/window
    */
    class XDMChannelManager implements IXDMChannelManager {
        private static _default;
        private _channels;
        constructor();
        static get(): XDMChannelManager;
        /**
        * Add an XDM channel for the given target window/iframe
        *
        * @param window Target iframe window to communicate with
        * @param targetOrigin Url of the target iframe (if known)
        */
        addChannel(window: Window, targetOrigin?: string): IXDMChannel;
        removeChannel(channel: IXDMChannel): void;
        private _handleMessageReceived;
        private _subscribe;
    }
}
declare module VSS {
    var VssSDKVersion: number;
    var VssSDKRestVersion: string;
    /**
    * Service Ids for core services (to be used in VSS.getService)
    */
    module ServiceIds {
        /**
        * Service for showing dialogs in the host frame
        * Use: <IHostDialogService>
        */
        var Dialog: string;
        /**
        * Service for interacting with the host frame's navigation (getting/updating the address/hash, reloading the page, etc.)
        * Use: <IHostNavigationService>
        */
        var Navigation: string;
        /**
        * Service for interacting with extension data (setting/setting documents and collections)
        * Use: <IExtensionDataService>
        */
        var ExtensionData: string;
    }
    /**
     * Initiates the handshake with the host window.
     *
     * @param options Initialization options for the extension.
     */
    function init(options: IExtensionInitializationOptions): void;
    /**
     * Ensures that the AMD loader from the host is configured and fetches a script (AMD) module
     * (and its dependencies). If no callback is supplied, this will still perform an asynchronous
     * fetch of the module (unlike AMD require which returns synchronously). This method has no return value.
     *
     * Usage:
     *
     * VSS.require(["VSS/Controls", "VSS/Controls/Grids"], function(Controls, Grids) {
     *    ...
     * });
     *
     * @param modules A single module path (string) or array of paths (string[])
     * @param callback Method called once the modules have been loaded.
     */
    function require(modules: string[] | string, callback?: Function): void;
    /**
    * Register a callback that gets called once the initial setup/handshake has completed.
    * If the initial setup is already completed, the callback is invoked at the end of the current call stack.
    */
    function ready(callback: () => void): void;
    /**
    * Notifies the host that the extension successfully loaded (stop showing the loading indicator)
    */
    function notifyLoadSucceeded(): void;
    /**
    * Notifies the host that the extension failed to load
    */
    function notifyLoadFailed(e: any): void;
    /**
    * Get the web context from the parent host
    */
    function getWebContext(): WebContext;
    /**
    * Get the configuration data passed in the initial handshake from the parent frame
    */
    function getConfiguration(): any;
    /**
    * Get the context about the extension that owns the content that is being hosted
    */
    function getExtensionContext(): IExtensionContext;
    /**
    * Gets the information about the contribution that first caused this extension to load.
    */
    function getContribution(): Contribution;
    /**
    * Get a contributed service from the parent host.
    *
    * @param contributionId Full Id of the service contribution to get the instance of
    * @param context Optional context information to use when obtaining the service instance
    */
    function getService<T>(contributionId: string, context?: Object): IPromise<T>;
    /**
    * Get the contribution with the given contribution id. The returned contribution has a method to get a registered object within that contribution.
    *
    * @param contributionId Id of the contribution to get
    */
    function getServiceContribution(contributionId: string): IPromise<IServiceContribution>;
    /**
    * Get contributions that target a given contribution id. The returned contributions have a method to get a registered object within that contribution.
    *
    * @param targetContributionId Contributions that target the contribution with this id will be returned
    */
    function getServiceContributions(targetContributionId: string): IPromise<IServiceContribution[]>;
    /**
    * Register an object (instance or factory method) that this extension exposes to the host frame.
    *
    * @param instanceId unique id of the registered object
    * @param instance Either: (1) an object instance, or (2) a function that takes optional context data and returns an object instance.
    */
    function register(instanceId: string, instance: Object | {
        (contextData?: any): Object;
    }): void;
    /**
    * Removes an object that this extension exposed to the host frame.
    *
    * @param instanceId unique id of the registered object
    */
    function unregister(instanceId: string): void;
    /**
    * Get an instance of an object registered with the given id
    *
    * @param instanceId unique id of the registered object
    * @param contextData Optional context data to pass to the contructor of an object factory method
    */
    function getRegisteredObject(instanceId: string, contextData?: Object): Object;
    /**
    * Fetch an access token which will allow calls to be made to other VSTS services
    */
    function getAccessToken(): IPromise<ISessionToken>;
    /**
    * Fetch an token which can be used to identify the current user
    */
    function getAppToken(): IPromise<ISessionToken>;
    /**
    * Requests the parent window to resize the container for this extension based on the current extension size.
    *
    * @param width Optional width, defaults to scrollWidth
    * @param height Optional height, defaults to scrollHeight
    */
    function resize(width?: number, height?: number): void;
    /**
     * Applies theme variables to the current document
     */
    function applyTheme(themeData: any): void;
}
