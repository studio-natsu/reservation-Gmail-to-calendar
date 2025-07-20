@echo off
cd /d D:\reservation-Gmail-to-calendar 
"D:\Program Files\nodejs\node.exe" npx ts-node src\main.ts >> log.txt 2>&1


rem cd /dはでDドライブに移動
rem @echo off
rem cd /d C:\Users\名前\Documents\badスクリプトが入っているフォルダ
rem Node.jsのパスは where node コマンドでしらべられる