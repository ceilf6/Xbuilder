#!/bin/bash
set -e

# Version of spx, keep in sync with the version in `.env`.
SPX_VERSION=2.0.0-beta9
SPX_NAME="spx_${SPX_VERSION}"
SPX_FILE_NAME="${SPX_NAME}.zip"
SPX_FILE_URL="https://github.com/goplus/spx/releases/download/v${SPX_VERSION}/spx_web.zip"

wget -O "${SPX_FILE_NAME}" "${SPX_FILE_URL}"
unzip -o "${SPX_FILE_NAME}" -d "./public/${SPX_NAME}"
rm "${SPX_FILE_NAME}"

# 重新应用我们对runner.html的修改
echo "重新应用runner.html的修改..."
cat > "./public/${SPX_NAME}/runner.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta name="viewport"
		content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
	<title>XGo Builder</title>
	<style>
		body,
		html {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #333;
			overflow: hidden;
		}

		canvas {
			display: block;
			margin: 0;
			outline: none;
		}
	</style>
</head>

<body>
	<div id="tabs">
		<div id="tab-loader">
		</div>
		<div id="tab-editor" style="display: none;">
			<canvas id="editor-canvas" tabindex="1"></canvas>
		</div>
		<div id="tab-game" style="display: none;">
			<canvas id="game-canvas" tabindex="2"></canvas>
		</div>
	</div>

	<script src="godot.editor.js"></script>
	<script src="jszip-3.10.1.min.js"></script>
	<script src="game.js"></script>
	<script>
		"use strict";
		let gameApp = null
		let isShowEditor = false
		let onGameError = null
		function onProgress(value) {
			const progressEvent = new CustomEvent('onProgress', {
				detail: {
					progress: value
				}
			});
			window.dispatchEvent(progressEvent);
			if (value >= 1) {
				document.getElementById('tab-game').style.display = 'none';
				document.getElementById('tab-editor').style.display = 'none';
				document.getElementById('tab-loader').style.display = 'none';
				let canvas = null
				if (gameApp.isEditor) {
					if (isShowEditor) {
						document.getElementById('tab-editor').style.display = 'block';
					}
					canvas = document.getElementById('editor-canvas')
				} else {
					document.getElementById('tab-game').style.display = 'block';
					canvas = document.getElementById('game-canvas')
				}
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}
		}

		window.gdspx_on_runtime_panic = function (msg) {
			if (onGameError != null) {
				onGameError(msg)
			}
		}

		window.onGameError = function (callback) {
			onGameError = callback
		}

		window.startGame = async (buffer, assetURLs = null, onSpxReady = null, logLevel = LOG_LEVEL_NONE) => {
			isShowEditor = false
			const config = {
				'projectName': "spx_game",
				'onProgress': onProgress,
				"gameCanvas": document.getElementById('game-canvas'),
				"editorCanvas": document.getElementById('editor-canvas'),
				"projectData": new Uint8Array(buffer),
				"logLevel": logLevel,
				"useAssetCache": false,
				"isRuntimeMode": true,
				"assetURLs": {
					"godot.editor.pck": "/godot.editor.pck",
					"engineres.zip": "/engineres.zip",
					"gdspx.wasm": "/gdspx.wasm",
					"godot.editor.wasm": "/godot.editor.wasm",
				},
			};
			if (assetURLs != null) {
				config.assetURLs = assetURLs
			}

			if (gameApp != null) {
				await gameApp.StopProject();
			}
			
			// load wasm
			let url = config.assetURLs["gdspx.wasm"]
			const go = new Go();
			const { instance } = await WebAssembly.instantiateStreaming(fetch(url), go.importObject);
			go.run(instance);
			if (onSpxReady != null) {
				onSpxReady()
			}

			// try install project and run game
			gameApp = new GameApp(config);
			await gameApp.StartProject();
			await gameApp.RunGame();
		}


		window.stopGame = async () => {
			if (gameApp == null) {
				console.error("gameApp is null, should call startGame first")
				return
			}
			await gameApp.StopProject()
			gameApp = null
		}

		window.pauseGame = async () => {
			if (gameApp == null || gameApp.game == null) {
				console.error("gameApp or game is null, should call startGame first")
				return
			}
			// 使用时间缩放来暂停游戏
			try {
				// 直接调用window上的时间缩放函数
				if (typeof window.gdspx_platform_set_time_scale === 'function') {
					window.gdspx_platform_set_time_scale(0.0);
					console.log("游戏已通过时间缩放暂停 (time_scale = 0.0)")
					return;
				}
				
				console.warn("无法找到时间缩放函数")
			} catch (error) {
				console.error("暂停游戏失败:", error)
			}
		}

		window.resumeGame = async () => {
			if (gameApp == null || gameApp.game == null) {
				console.error("gameApp or game is null, should call startGame first")
				return
			}
			// 使用时间缩放来恢复游戏
			try {
				// 直接调用window上的时间缩放函数
				if (typeof window.gdspx_platform_set_time_scale === 'function') {
					window.gdspx_platform_set_time_scale(1.0);
					console.log("游戏已通过时间缩放恢复 (time_scale = 1.0)")
					return;
				}
				
				console.warn("无法找到时间缩放函数")
			} catch (error) {
				console.error("恢复游戏失败:", error)
			}
		}

		// 调试函数：查看可用的暂停/恢复方法
		window.debugGameMethods = () => {
			console.log("=== 调试游戏方法 ===");
			console.log("gameApp:", gameApp);
			if (gameApp && gameApp.game) {
				console.log("gameApp.game:", gameApp.game);
				console.log("gameApp.game methods:", Object.getOwnPropertyNames(gameApp.game));
				console.log("gameApp.game prototype:", Object.getOwnPropertyNames(Object.getPrototypeOf(gameApp.game)));
			}
			console.log("Module:", typeof Module !== 'undefined' ? Module : 'undefined');
			if (typeof Module !== 'undefined') {
				console.log("Module methods:", Object.getOwnPropertyNames(Module).filter(name => name.includes('gdspx')));
			}
			console.log("window methods:", Object.getOwnPropertyNames(window).filter(name => name.includes('gdspx')));
		}

		// Inform the parent window that the runner is ready (methods on the window object are callable)
		window.dispatchEvent(new Event('runnerReady'));
	</script>
</body>

</html>
EOF
