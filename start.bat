@echo off

D:
cd "D:\OneDrive\Backup\Jared's Desktop 2\Desktop\Discord bot"

start /min python main.py
start /min InputOutput/do_math/main2.py

cd "D:\WebServer\files\upload"
start /min python webserver_3.py

cd "D:\OneDrive\Backup\Jared's Desktop 2\Desktop\Discord bot"
:main
node .
goto main