@echo off

C:
cd "C:\OneDrive\Backup\Jared's Desktop 2\Desktop\Discord bot"

start /min python main.py
start /min InputOutput/do_math/main2.py

:main
node .
goto main