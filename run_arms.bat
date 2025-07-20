@echo off
cd /d D:\arms 
"D:\Program Files\nodejs\node.exe" TS_arms\main.js >> log.txt 2>&1


rem cd /dはでDドライブに移動
rem @echo off
rem cd /d C:\Users\名前\Documents\badスクリプトが入っているフォルダ
rem "C:\Program Files\nodejs\node.exe" dist\main.js
rem Node.jsのパスは where node コマンドでしらべられる