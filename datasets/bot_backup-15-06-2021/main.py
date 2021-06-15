import selenium, random, time, os, traceback, subprocess, psutil, signal
from selenium import webdriver
from urllib.request import urlretrieve, urlopen
from googletrans import Translator

driver = webdriver.Chrome("chromedriver.exe")
website_url = "https://danbooru.donmai.us"
henati_tags = "&tags=breasts+"
trust_modules = ["datetime", "math", "random", "hashlib", "time", "getpass", "socket", "urllib"]
dangerious_keywords = ["input", "exec", "eval", "compile", "open", "builtins", "os", "globals", "locals", "breakpoint", "dir", "delattr", "getattr", "repr", "vars"]
cat_memes = []
normal_memes = []

IO_folder = "InputOutput/"

def clever_bot():
    try:
        user_input = open(IO_folder+"chat_bot_input.txt", "r", encoding="utf-8").read()
        if user_input == "":
            return True
        elif user_input.lower() == "restart_restart_node_js":
            print("restarting bot!")
            # kill the bot process
            os.popen("taskkill /f /im node.exe")

            # start bot
            time.sleep(2)
            os.popen("start /min node .")
            time.sleep(5)

            # write that the bot restarted!
            with open(IO_folder+"chat_bot_input.txt", "w") as file:
                file.write("restart_successful")
            
            return True
            
        else:
            print("input:", user_input)

        # clear input file
        with open(IO_folder+"chat_bot_input.txt", "w", encoding="utf-8") as input_file:
            input_file.write("")

        # clear output file
        with open(IO_folder+"chat_bot_output.txt", "w", encoding="utf-8") as output_file:
            output_file.write("")

        # go to website if it is not open
        if "cleverbot.com" not in driver.current_url:
            driver.get("https://www.cleverbot.com/")
            time.sleep(1)
            driver.execute_script("document.querySelectorAll('[type=\"submit\"][value=\"understood, and agreed\"]')[0].click()")

        # submit input to clever bot
        driver.execute_script("document.querySelectorAll('[placeholder=\"say to cleverbot...\"]')[0].value = '"+user_input+"'")
        driver.find_elements_by_xpath('//form[@id="avatarform"]//input[@name="stimulus"]')
        driver.execute_script("cleverbot.sendAI();")

        # get output
        output = driver.execute_script("return document.querySelector('[id=\"line1\"]').innerText")
        while False not in ["." not in output, "?" not in output]:
            output = driver.execute_script("return document.querySelector('[id=\"line1\"]').innerText")
        print("output:", output)

        # write output to file
        with open(IO_folder+"chat_bot_output.txt", "w", encoding="utf-8") as output_file:
            output_file.write(output)
            
    except Exception as error:
        print("an error occured in clever bot!", error)

        # write output to file
        with open(IO_folder+"chat_bot_output.txt", "w", encoding="utf-8") as output_file:
            output_file.write("...")

while True:
    try:
        clever_bot()
        
    except Exception as err:
        print("error in while", err)
