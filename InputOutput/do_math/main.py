from selenium import webdriver
import pickle, time

url = "https://www.mathway.com/Algebra"
cookies_list = ["cookies_algebra.pkl", "cookies_settings.pkl"]

# on first time run wait for user to signin then save cookies
def save_cookie():
    driver.get("https://www.mathway.com/settings")
    time.sleep(4)
    pickle.dump(driver.get_cookies(), open(cookies_list[1], "wb"))
    driver.get("https://www.mathway.com/Algebra")
    time.sleep(4)
    pickle.dump(driver.get_cookies(), open(cookies_list[0], "wb"))
    print("[+] Saved cookies!")

def load_cookie(url):
    try:
        print("[+] Loading cookies...")
        for i, c in enumerate(["Algebra", "settings"]):
            driver.get("https://www.mathway.com/"+c)
            time.sleep(4)
            cookies = pickle.load(open(cookies_list[i], "rb"))
            for cookie in cookies:
                driver.add_cookie(cookie)
    except:
        input("[-] Please signin then press enter to continue...")
        save_cookie()
        driver.get(url)

# load cookies
driver = webdriver.Chrome('chromedriver.exe')
load_cookie(url)

# enter users question
# wait for answer
# screenshot the answer in main window
# screenshow the workings out
# send to user
