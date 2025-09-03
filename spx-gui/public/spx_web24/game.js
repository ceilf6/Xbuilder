var Module = null

class GameApp {
    constructor(config) {
        config = config || {};
        this.config = config;
        this.editor = null;
        this.game = null;
        this.packName = 'engine.zip';
        this.projectDataName = 'game.zip';
        this.persistentPath = 'engine';
        this.logLevel = config.logLevel;
        this.projectData = config.projectData;
        this.oldData = config.projectData;
        this.gameCanvas = config.gameCanvas;
        this.assetURLs = config.assetURLs;
        this.gameConfig = {
            "executable": "engine",
            'unloadAfterInit': false,
            'canvas': this.gameCanvas,
            'logLevel': this.logLevel,
            'canvasResizePolicy': 1,
            'onExit': () => {
                this.onGameExit()
            },
        };
        this.recordingOnGameStart = config.recordingOnGameStart || false
        this.autoDownloadRecordedVideo = config.autoDownloadRecordedVideo || false
        this.logicPromise = Promise.resolve();
        this.curProjectHash = ''
        // 录制状态管理
        this.recordingStarted = false
        this.recordingData = null
        // web worker mode
        this.workerMode = EnginePackMode == "worker"
        this.minigameMode = EnginePackMode == "minigame"
        this.miniprogramMode = EnginePackMode == "miniprogram"
        this.normalMode = !this.workerMode && !this.minigameMode && !this.miniprogramMode

        this.useAssetCache = config.useAssetCache || this.miniprogramMode;

        // init worker message manager
        this.workerMessageManager = new globalThis.WorkerMessageManager();

        // init storage manager
        this.storageManager = new StorageManager({
            webPersistentPath: '/home/web_user',
            projectInstallName: config.projectName || "Game",
            useAssetCache: true,
            assetURLs: this.assetURLs,
            logVerbose: this.logVerbose.bind(this)
        });

        this.logVerbose("EnginePackMode: ", EnginePackMode)
    }
    logVerbose(...args) {
        if (this.logLevel == LOG_LEVEL_VERBOSE) {
            console.log(...args);
        }
    }
    startTask(prepareFunc, taskFunc, ...args) {
        if (prepareFunc != null) {
            prepareFunc()
        }
        this.logicPromise = this.logicPromise.then(async () => {
            let promise = new Promise(async (resolve, reject) => {
                await taskFunc.call(this, resolve, reject, ...args);
            })
            await promise
        })
        return this.logicPromise
    }

    async RunGame() {
        return this.startTask(() => { this.runGameTask++ }, this.runGame)
    }

    async StopGame() {
        return this.startTask(() => { this.stopGameTask++ }, this.stopGame)
    }


    async runGame(resolve, reject) {
        await this.onRunPrepareEngineWasm()

        this.runGameTask--
        // if stopGame is called before runing game, then do nothing
        if (this.stopGameTask > 0) {
            this.logVerbose("stopGame is called before runing game")
            resolve()
            return
        }

        let args = [
            '--main-pack', this.persistentPath + "/" + this.packName,
            '--main-project-data', this.persistentPath + "/" + this.projectDataName,
        ];
        if (this.recordingOnGameStart) {
            args.push('--write-movie', this.persistentPath + "/" + "movie.avi")
        }

        this.logVerbose("RunGame ", args);
        if (this.game) {
            this.logVerbose('A game is already running. Close it first');
            resolve()
            return;
        }

        this.onProgress(0.5);
        this.game = new Engine(this.gameConfig);
        let curGame = this.game

        // register global functions
        window.gdspx_on_engine_start = function () { }
        window.gdspx_on_engine_update = function () { }
        window.gdspx_on_engine_fixed_update = function () { }
        window.goWasmInit = function () { }
        const spxfuncs = new GdspxFuncs();
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(spxfuncs));
        methodNames.forEach(key => {
            if (key.startsWith('gdspx_') && typeof spxfuncs[key] === 'function') {
                globalThis[key] = spxfuncs[key].bind(spxfuncs);
            }
        });


        await this.onRunBeforInit()
        this.onProgress(0.5);

        curGame.init().then(async () => {
            this.onProgress(0.6);
            await this.unpackGameData(curGame)
            this.onProgress(0.7);
            await this.onRunAfterInit(curGame)
            this.onProgress(0.80);
            curGame.start({ 'args': args, 'canvas': this.gameCanvas }).then(async () => {
                this.onProgress(0.9);
                this.gameCanvas.focus();
                await this.onRunAfterStart(curGame)
                this.onProgress(1.0);
                this.gameCanvas.focus();
                this.logVerbose("==> game start done")
                resolve()
            });
        });
    }


    async stopGame(resolve, reject) {
        this.stopGameTask--
        if (this.game == null) {
            // no game is running, do nothing
            resolve()
            this.logVerbose("no game is running")
            return
        }
        this.stopGameResolve = () => {
            this.game = null
            resolve();
            this.stopGameResolve = null
        }
        this.onProgress(1.0);
        this.game.requestQuit()

        if(this.recordingOnGameStart && this.autoDownloadRecordedVideo){
            let fileName = `spx_${new Date().getTime()}.webm`;
            this.downloadRecordedVideo(fileName)
        } 
    }

    downloadRecordedVideo(fileName) { 
        Module.downloadRecordedVideo(fileName)
    }

    getRecordedVideo() { 
        try {
            // 检查 Module 是否存在
            if (!Module) {
                console.error("Module is not available for getRecordedVideoBlob")
                return null
            }
            
            // 检查 getRecordedVideoBlob 方法是否存在
            if (typeof Module.getRecordedVideoBlob !== 'function') {
                console.error("Module.getRecordedVideoBlob is not a function")
                return null
            }
            
            // 检查录制状态
            console.log("检查录制状态...")
            
            // 检查应用程序级别的录制状态
            console.log("应用录制状态:", {
                recordingStarted: this.recordingStarted,
                hasRecordingData: !!this.recordingData
            })
            
            // 检查是否有录制相关的状态变量
            const hasRecordingState = Module._gdspx_is_recording || 
                                     Module.isRecording || 
                                     Module._recording_active ||
                                     Module.recordingData ||
                                     Module._record_data;
                                     
            console.log("录制状态检查:", {
                appRecordingStarted: this.recordingStarted,
                hasRecordingState: !!hasRecordingState,
                moduleMemory: !!Module._memory,
                hasCanvas: !!this.gameCanvas
            })
            
            console.log("调用 Module.getRecordedVideoBlob()...")
            
            // 使用 try-catch 包装具体调用，防止引擎内部错误
            let result = null
            try {
                result = Module.getRecordedVideoBlob()
            } catch (innerError) {
                console.error("Module.getRecordedVideoBlob() 内部异常:", innerError)
                
                // 如果引擎内部出错，尝试使用备用方案
                if (this.gameCanvas && this.gameCanvas instanceof HTMLCanvasElement) {
                    console.log("尝试使用画布截图作为备用方案...")
                    try {
                        const canvasPromise = new Promise((resolve) => {
                            this.gameCanvas.toBlob((blob) => {
                                if (blob && blob.size > 0) {
                                    console.log("成功生成画布截图作为备用:", {
                                        size: blob.size,
                                        type: blob.type
                                    })
                                    // 重置录制状态
                                    this.recordingStarted = false
                                    this.recordingData = blob
                                    resolve(blob)
                                } else {
                                    console.warn("画布截图生成失败")
                                    resolve(null)
                                }
                            }, 'image/png')
                        })
                        console.log("返回画布截图 Promise")
                        return canvasPromise
                    } catch (canvasError) {
                        console.error("画布截图也失败:", canvasError)
                    }
                }
                
                return null
            }
            
            console.log("Module.getRecordedVideoBlob() 返回结果:", {
                type: typeof result,
                isBlob: result instanceof Blob,
                isNull: result === null,
                isUndefined: result === undefined,
                size: result instanceof Blob ? result.size : 'N/A'
            })
            
            // 验证返回结果
            if (result === null || result === undefined) {
                console.warn("Module.getRecordedVideoBlob() 返回了 null 或 undefined")
                return null
            }
            
            // 成功获取录制数据后重置状态
            console.log("成功获取录制数据，重置录制状态")
            this.recordingStarted = false
            this.recordingData = result
            
            return result
        } catch (error) {
            console.error("getRecordedVideo() 执行异常:", error)
            console.error("错误堆栈:", error.stack)
            
            // 提供更多错误上下文
            console.error("Module 状态:", {
                moduleExists: !!Module,
                moduleType: typeof Module,
                hasGetRecordedVideoBlob: Module && typeof Module.getRecordedVideoBlob === 'function',
                moduleKeys: Module ? Object.keys(Module).slice(0, 10) : [] // 显示前10个键
            })
            
            return null
        }
    }

    startRecording() {
        try {
            if (!Module || typeof Module.tryStartRecording !== 'function') {
                console.error("录制开始失败: Module.tryStartRecording 不可用")
                throw new Error("录制功能不可用")
            }
            
            console.log("开始录制...")
            this.recordingStarted = true
            this.recordingData = null // 清空之前的录制数据
            
            const result = Module.tryStartRecording()
            console.log("录制开始结果:", result)
            
            return result
        } catch (error) {
            console.error("录制开始异常:", error)
            this.recordingStarted = false
            throw error
        }
    }

    async stopRecording() {
        try {
            if (!Module || typeof Module.tryStopRecording !== 'function') {
                console.error("录制停止失败: Module.tryStopRecording 不可用")
                throw new Error("录制功能不可用")
            }
            
            if (!this.recordingStarted) {
                console.warn("录制尚未开始，无法停止")
                return null
            }
            
            console.log("停止录制...")
            const result = await Module.tryStopRecording()
            console.log("录制停止结果:", result)
            
            // 先不重置录制状态，等待数据获取完成
            // this.recordingStarted = false
            
            // 等待一段时间确保录制数据处理完成
            console.log("等待录制数据处理完成...")
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            return result
        } catch (error) {
            console.error("录制停止异常:", error)
            this.recordingStarted = false
            throw error
        }
    } 

    onGameExit() {
        this.game = null
        this.logVerbose("on game quit")
        if (this.stopGameResolve) {
            this.stopGameResolve()
        }
    }
    pause() {
        let funPtr = this.game.rtenv["_gdspx_ext_pause"]
        if(funPtr != null){
            funPtr()
        }
    }

    resume() {
        let funPtr = this.game.rtenv["_gdspx_ext_resume"]
        if(funPtr != null){
            funPtr()
        }
    }

    stepNextFrame() {
        let funPtr = this.game.rtenv["_gdspx_ext_next_frame"]
        if(funPtr != null){
            funPtr()
        }
    }
    //------------------ misc ------------------
    onProgress(value) {
        if (this.config.onProgress != null) {
            this.config.onProgress(value);
        }
    }
    async unpackGameData(game) {
        let packUrl = this.assetURLs[this.packName]
        let pckData = await (await fetch(packUrl)).arrayBuffer();
        await game.unpackGameData(this.persistentPath, this.projectDataName, this.projectData.buffer, this.packName, pckData)
    }

    callWorkerFunction(funcName, ...args) {
        this.workerMessageManager.callWorkerFunction(funcName, ...args)
    }


    //------------------ onRun ------------------
    async onRunPrepareEngineWasm() {
        let url = this.assetURLs["engine.wasm"]
        if (isWasmCompressed) {
            url += ".br"
        }

        if (this.minigameMode) {
            this.gameConfig.wasmEngine = url
        } else {
            if (this.useAssetCache) {
                const engineCacheResult = await this.storageManager.checkEngineCache(GetEngineHashes());
                this.gameConfig.wasmGdspx = engineCacheResult.wasmGdspx;
                this.gameConfig.wasmEngine = engineCacheResult.wasmEngine;
            } else {
                if (!this.gameConfig.wasmEngine) {
                    this.gameConfig.wasmEngine = await (await fetch(url)).arrayBuffer();
                }
            }
        }
    }

    async onRunBeforInit() {
        if (this.minigameMode) {
            GameGlobal.engine = this.game;
            godotSdk.set_engine(this.game);
            self.initExtensionWasm = function () { }
        } else {
            if (!this.workerMode) {
                await this.loadLogicWasm()
                await this.runLogicWasm()
                self.initExtensionWasm = function () { }
            }
        }
    }

    async onRunAfterInit(game) {
        if (this.workerMode) {
            this.workerMessageManager.bindMainThreadCallbacks(game)
        }
        if (this.minigameMode) {
            await this.loadLogicWasm()
        }
    }

    async onRunAfterStart(game) {
        if (this.minigameMode) {
            FFI = self;
            await this.runLogicWasm()
        }
        if (this.workerMode) {
            let pthreads = game.getPThread()
            this.workerMessageManager.setPThreads(pthreads)
            this.workerMessageManager.callWorkerProjectDataUpdate(this.projectData, this.assetURLs)
        } else {
            // register global functions
            Module = game.rtenv;
            FFI = self;
            window.goLoadData(new Uint8Array(this.projectData));
        }
    }

    //------------------ logic wasm ------------------
    async loadLogicWasm() {
        // load wasm
        let url = this.config.assetURLs["gdspx.wasm"];
        if (isWasmCompressed) {
            url += ".br"
        }
        this.go = new Go();
        if (this.minigameMode) {
            // load wasm in miniEngine
            const wasmResult = await WebAssembly.instantiate(url, this.go.importObject);
            // create compatible instance
            this.logicWasmInstance = Object.create(WebAssembly.Instance.prototype);
            this.logicWasmInstance.exports = wasmResult.instance.exports;
            Object.defineProperty(this.logicWasmInstance, 'constructor', {
                value: WebAssembly.Instance,
                writable: false,
                enumerable: false,
                configurable: true
            });
        } else {
            if (this.useAssetCache) {
                const { instance } = await WebAssembly.instantiate(this.gameConfig.wasmGdspx, this.go.importObject);
                this.logicWasmInstance = instance;
            } else {
                const { instance } = await WebAssembly.instantiateStreaming(fetch(url), this.go.importObject);
                this.logicWasmInstance = instance;
            }
        }
    }
    async runLogicWasm() {
        this.go.run(this.logicWasmInstance);
        if (!this.minigameMode) {
            if (this.config.onSpxReady != null) {
                this.config.onSpxReady()
            }
        }
    }

}

// export GameApp to global
globalThis.GameApp = GameApp;
function GetEngineHashes() { 
	return {
"gdspx.wasm":"017bfe922206b8b95372a4b43883ce04d74a35ff12d374aa1883bdd33c0fadd4",
"engine.wasm":"a4adbdc49f49f827681bf375cc7e44d22c65a7e3f8fb71d65891afc28140dc88",

	}
}
	